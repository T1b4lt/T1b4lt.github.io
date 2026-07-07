---
idx: 4
title: "LLM Quantization: Decoding the Alphabet Soup in Model Names"
author: "Guillermo"
pubDate: "July 7th, 2026"
pubDateLogical: "2026-07-07"
tags: ["AI", "LLMs", "Quantization", "Inference"]
---

You open Ollama or Hugging Face looking for a model to run on your own machine and you are greeted by this:

```
Llama-3.1-8B-Instruct-Q4_K_M.gguf
Mistral-7B-Instruct-v0.3.Q5_K_S.gguf
Qwen2.5-14B-Instruct-IQ2_XS.gguf
```

`Q4_K_M`? `IQ2_XS`? Is this a language model or a Scrabble rack?

That entire alphabet soup exists for one single reason: **quantization**, the technique that lets a model that would normally require a 30,000-euro server GPU run on your laptop. In this post we will look at what it is, how it works under the hood, and above all, how to read those names so you can pick the right model without losing your mind.

## An LLM is (basically) a giant list of numbers

When we say that Llama has **7B parameters**, we are talking about 7 billion numbers: the weights of the neural network. Each weight is a decimal number which, by default, is stored in **float32 (FP32)** format: 32 bits, that is, 4 bytes.

Let's do the math:

```
7,000,000,000 parameters x 4 bytes = 28 GB
```

Just loading the model into memory already requires **28 GB**. And a 70B model? **280 GB**. Forget about running it on your computer, and in fact forget about running it on a single professional GPU.

But what if we used fewer bytes per parameter? If each weight takes 1 byte (INT8) instead of 4, the 7B model shrinks to 7 GB. Go down to 4 bits (INT4) and it is 3.5 GB. That fits on a laptop.

![Memory needed to load a 7B model at different precisions](/images/blog/quantization-precision-memory.svg)

That is exactly the trick: quantization is the process of **converting high-precision numbers into low-precision formats** to reduce memory and compute requirements. You lose some accuracy along the way, yes, but practice has shown the loss is surprisingly small. We will see how small later.

## Bits, floats and integers: the precision catalog

Before quantizing anything, it helps to understand what each numeric format means. A floating-point number splits its bits into three parts:

- **Sign:** 1 bit. Positive or negative.
- **Exponent:** controls the **range**, i.e. how big or small numbers can get.
- **Mantissa:** controls the **precision**, i.e. how many decimal places we can distinguish.

![How each numeric format spends its bits](/images/blog/quantization-bit-layout.svg)

The formats you will run into:

- **FP32:** the classic training format. Maximum range and precision, maximum cost.
- **FP16:** half the bits. Keeps decent precision but slashes the exponent, so large values can overflow.
- **BF16 (bfloat16):** deep learning's favourite. Same number of bits as FP16, distributed differently: it keeps FP32's 8 exponent bits (same range, goodbye overflows) in exchange for sacrificing precision. For neural networks, that trade is worth it.
- **INT8 / INT4:** no exponent, no decimals. Plain old integers: INT8 can represent 256 values (from -128 to 127) and INT4 only **16 values**. Converting float weights to these formats is the heart of quantization.

## How a weight gets quantized: scale and zero-point

Let's get concrete. Neural network weights usually live in a small range, say between -1 and 1: values like `-0.91`, `0.78`, `-0.28`... How do we turn those into integers between -128 and 127?

With a change of scale, very similar to classic feature scaling in machine learning. First we compute the scale factor:

```
scale = (Xmax - Xmin) / (Qmax - Qmin) = (1 - (-1)) / (127 - (-128)) = 0.0078
```

Then we map each weight `x` to its quantized version `q`:

```
q = round((x - zero_point) / scale)
```

The `zero_point` says where we center the range (in our example, 0). For the weight `-0.91`:

```
q = round(-0.91 / 0.0078) = -116
```

The float `-0.91` becomes the integer `-116`. To use the weight during inference, we apply the inverse operation (**dequantization**):

```
x' = q * scale + zero_point = -116 * 0.0078 = -0.9048
```

We stored `-0.91` and got back `-0.9048`. Not identical: that difference is the **quantization error**. It is like compressing and decompressing a file with a lossy algorithm: you recover something very close, but not exactly the same. Quantization's bet is that the neural network is robust enough that millions of tiny errors like this barely affect its answers.

Two variants you will see mentioned:

- **Symmetric (absmax):** the range is centered at zero and scaled using the maximum absolute value. Simpler and faster.
- **Asymmetric (zero-point):** uses the actual minimum and maximum, with an extra offset. Makes better use of the bits when the distribution is not centered.

## The NF4 trick: not all bins are equal

With 4 bits we only have 16 possible values. The naive approach is to split the range into 16 equal-width intervals (bins) and assign each weight to its bin. But here a problem appears: if you plot the histogram of an LLM's weights, you get a **normal distribution**, the classic bell curve centered at zero.

With equal-width bins, the vast majority of the weights (which live near zero) end up crammed into 3 or 4 central values, while the bins at the extremes sit almost empty. We are wasting most of our scarce 16 values.

![Linear bins vs equal-probability bins (NF4)](/images/blog/quantization-linear-vs-nf4.svg)

The solution is pure common sense: instead of equal-**width** bins, use equal-**probability** bins. The 16 levels are designed so that each one captures 6.25% of the weights: narrow bins near zero (where there are lots of weights and we need fine resolution) and wide ones in the tails (where there is barely anything).

That is exactly **NF4 (NormalFloat 4-bit)**, the format used by the `bitsandbytes` library and the one at the heart of **QLoRA**, the standard technique for fine-tuning LLMs on modest GPUs.

## Decoding the model name

With the theory in our backpack, we can now return to the alphabet soup from the beginning:

![Anatomy of a quantized model name](/images/blog/quantization-name-anatomy.svg)

The quantization part in GGUF files follows the pattern `Q{bits}_{method}_{mix}`:

- **Q4:** average number of **bits per weight**. Q8 is nearly lossless, Q4 is the typical balance, Q2 is extreme compression.
- **K:** indicates **k-quants**, llama.cpp's modern scheme. Instead of a single global scale, weights are grouped into blocks and super-blocks, each with its own scale. This way the quantization error adapts locally to each region of the model.
- **S / M / L (small/medium/large):** the **precision mix**. Not all layers are equally sensitive: the M and L variants store the most critical layers (like attention and embeddings) with more bits, in exchange for a slightly bigger file.

With that you can read almost any name:

- **Q8_0:** 8 bits, legacy scheme (the `_0` means scale only, no offset). Practically indistinguishable from the original.
- **Q6_K:** 6 bits with k-quants. Very conservative.
- **Q4_K_M:** 4 bits, k-quants, medium mix. **The de facto standard**, and what Ollama downloads by default.
- **IQ2_XS:** the **IQ (i-quants)** family uses more sophisticated techniques backed by an **imatrix** (importance matrix): a calibration dataset is run through the model to measure which weights matter most and protect them during quantization. It is what makes going below 3 bits viable without the model starting to talk nonsense. The XXS/XS/S/M suffixes are, again, points along the size-quality axis.

## The format zoo: GGUF, GPTQ, AWQ and bitsandbytes

GGUF is not the only family. Depending on where and why you want to run the model, you will run into these names:

| Format           | Where it shines                        | The key idea                                                                                              |
| ---------------- | -------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| **GGUF**         | Local: CPU, Apple Silicon, partial GPU | Single file for llama.cpp/Ollama/LM Studio. Can split layers between CPU and GPU                          |
| **GPTQ**         | GPU inference                          | Quantizes layer by layer using second-order information and compensates the error in neighbouring weights |
| **AWQ**          | GPU serving (vLLM)                     | Detects the ~1% most important weights by looking at activations and shields them from quantization       |
| **bitsandbytes** | Fine-tuning (QLoRA)                    | Quantizes on the fly when loading the model (`load_in_4bit=True`). Convenient, but slow for serving       |

The quick rule: to run models on your own machine, **GGUF**; to serve models on GPU to many users, **AWQ or GPTQ**; to fine-tune on a budget, **bitsandbytes + QLoRA**.

One last vocabulary note: everything above is **PTQ (Post-Training Quantization)**, quantizing an already-trained model, which is the usual approach because it is cheap. The alternative is **QAT (Quantization-Aware Training)**: training the model while simulating quantization so it learns to live with it. It gives better results at very low bit counts, but requires retraining, something only the model's creators can afford (Google, for instance, publishes QAT versions of Gemma).

## So how much quality am I losing?

The million-dollar question. The short answer: **much less than you think, until suddenly you lose a lot**.

![Quality vs size across llama.cpp quantizations](/images/blog/quantization-quality-size.svg)

The data in the chart (Llama-3.1-8B-Instruct evaluated on MMLU, GSM8K, HellaSwag and other benchmarks) tells a very clear story:

- From **F16 to Q8_0** the model goes from 15 GB to 8 GB and the quality difference is statistical noise.
- At **Q4_K_M** the file is **3.3 times smaller** than the original and the average score drops barely 0.3 points. That is why it is the sweet spot.
- Below ~3.5 bits per weight (**Q3_K_S** and lower), the curve falls off a cliff. And it does not fall uniformly: reasoning tasks like GSM8K math collapse first (9 points), while simpler tasks barely flinch. An over-quantized model can seem fine in a chat and fail spectacularly at arithmetic.

## Final cheat sheet

If you only take one table away from this post, make it this one:

| If...                                          | Use...                                            |
| ---------------------------------------------- | ------------------------------------------------- |
| You have memory to spare and want max fidelity | Q8_0 or Q6_K                                      |
| You want the standard balance                  | **Q4_K_M**                                        |
| You are tight on memory                        | Q4_K_S or IQ4_XS                                  |
| The model will not fit no matter what          | IQ3/IQ2 with imatrix, and lower your expectations |
| You are fine-tuning on a small GPU             | bitsandbytes NF4 (QLoRA)                          |
| You are serving a model on GPU in production   | AWQ or GPTQ                                       |

Quantization is probably the technique with the best effort-to-benefit ratio in the whole LLM ecosystem: four times less memory in exchange for a quality loss you will not even notice in most cases. And now, when you see `Q4_K_M` in a file name, you will no longer see a Scrabble move, but exactly what was done to those 8 billion numbers so they could fit on your laptop.

## Further reading

- [A Visual Guide to Quantization](https://newsletter.maartengrootendorst.com/p/a-visual-guide-to-quantization) - excellent visual explanation by Maarten Grootendorst.
- [Which Quantization Should I Use?](https://arxiv.org/html/2601.14277v1) - the systematic evaluation behind the quality-vs-size chart.
- [LLM Fine Tuning Crash Course](https://www.youtube.com/watch?v=IIvORO248Zs) - minutes 13:00-29:00 explain quantization and NF4 step by step with code.
