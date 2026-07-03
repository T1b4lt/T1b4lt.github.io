---
idx: 3
title: "KV Cache: The Hidden Memory Powering LLMs"
author: "Guillermo"
pubDate: "July 3rd, 2026"
pubDateLogical: "2026-07-03"
tags: ["AI", "LLMs", "Transformers", "Inference"]
---

If you have ever wondered how a language model like GPT, Llama, or DeepSeek can generate text at a reasonable speed despite having billions of parameters, a large part of the answer boils down to three letters: **KV cache**. This optimization technique is so fundamental to LLM inference that without it, text generation would be practically unfeasible at production scale.

In this post I will explain what the KV cache is, why it exists, how it works under the hood, and what the most recent research techniques are for dealing with its main limitation: massive memory consumption.

## The problem: quadratic redundancy

Language models based on the Transformer architecture generate text **autoregressively**: they predict and produce one token (word or subword) at a time, conditioned on the entire preceding sequence.

At each generation step, the attention mechanism needs to compute three vectors for each token in the sequence:

- **Query (Q):** What the current token "asks" of the context.
- **Key (K):** What each past token "offers" as an identifier.
- **Value (V):** The information each past token contributes if found relevant.

Without any optimization, every time the model generates a new token it must **recompute K and V for all previous tokens from scratch**. At step 1 it computes 1 KV pair. At step 2, it recomputes 2 pairs. At step 100, it recomputes 100 pairs. The total cost grows quadratically: O(n**2).

![Autoregressive generation: the redundancy problem](/images/blog/kv-cache-redundancy.svg)

This makes generation extremely slow for long sequences. If generating 100 tokens costs X, generating 200 does not cost 2X but 4X.

## The solution: KV Cache

The KV cache is conceptually simple: **store the K and V vectors of already-processed tokens so they never need to be recomputed**. It works in two phases:

### Phase 1: Prefill (prompt processing)

When the model receives the user's prompt, it processes all input tokens in parallel. It computes Q, K, and V vectors for each token and stores the K and V pairs in the cache. This phase maximizes GPU parallelism.

### Phase 2: Decode (token-by-token generation)

From this point on, for each newly generated token:

1. Q, K, and V are computed **only for the new token**.
2. The K and V vectors for all previous tokens are retrieved from the cache.
3. The attention operation runs using the new token's Q against all stored K vectors.
4. The new K and V vectors are appended to the cache for the next step.

The result is that the computational cost per generation step remains **constant**, and the total cost grows linearly: O(n). The speed improvement is dramatic.

## The price: memory

Speed is not free. Storing all those K and V vectors consumes a significant amount of video memory (VRAM) on the GPU, and this amount grows linearly with the sequence length.

![KV cache memory cost for long contexts](/images/blog/kv-cache-memory-tradeoff.svg)

For a model like Llama 3 70B in FP16, the KV cache for a 128K token sequence can consume around 80 GB of VRAM, exceeding even the space occupied by the model's own parameters. When multiple requests are processed simultaneously (batching), the problem multiplies.

The KV cache has become the **main memory bottleneck** in modern LLMs. This has generated an extremely active research field focused on compressing it without sacrificing quality.

## Implementation: how it works under the hood

The KV cache is not a neural network layer with trainable weights. It is a **dynamic memory buffer** (tensors) that lives alongside each self-attention layer in the model.

Since each Transformer layer has its own attention mechanism with independent projection matrices for K and V, the cache is implemented as a pair of tensors per layer, with dimensions `[batch, num_heads, seq_len, head_dim]`. The full model cache is structured as:

```
((K_1, V_1), (K_2, V_2), ..., (K_L, V_L))
```

where `L` is the number of layers.

In libraries like Hugging Face's `transformers`, the KV cache is implemented natively. The `use_cache=True` parameter (enabled by default for generation) controls its use. Internally, the `past_key_values` object propagates between generation steps: on the first step it contains the prompt's KV pairs, and on each subsequent step the new token's KV pairs are concatenated. All of this happens transparently when calling `model.generate()`.

## Optimization techniques: compressing the KV cache

Given the importance of the problem, multiple active research lines aim to reduce the KV cache's memory consumption. The main approaches fall into three categories: architectural modifications, quantization, and dynamic context management.

### Architectural modifications

The idea is to reduce the number of KV pairs the model needs to store by redesigning how attention heads are organized.

![Attention mechanism comparison: MHA vs MQA vs GQA vs MLA](/images/blog/kv-cache-attention-comparison.svg)

#### Multi-Head Attention (MHA) - The baseline

Standard attention: each query head Q has its own independent K and V pair. This is the original Transformer architecture and offers the best quality, but with the highest cache memory cost.

#### Multi-Query Attention (MQA) - The minimalist extreme

Proposed as an aggressive optimization: **all Q heads share a single KV pair**. It reduces the cache to a fraction (e.g., 12.5% with 8 heads), but the quality loss is significant. It was used in early models like Falcon, but today it is **mostly superseded**.

#### Grouped-Query Attention (GQA) - The current standard

The sweet spot that dominates the industry. Q heads are organized into **g groups**, and each group shares a KV pair. With g=2 over 8 heads, the cache is reduced to 25% while maintaining quality very close to MHA.

It is the default technique in most current open models: **Llama 2, Llama 3, Mistral, Gemma**.

#### Multi-Head Latent Attention (MLA) - The new frontier

Introduced by DeepSeek (V2, V3, R1), MLA takes a radically different approach: instead of grouping heads, it **compresses K and V vectors into a single low-dimensional latent vector** (`c_t`). This compressed vector is the only thing the GPU needs to store. When computing attention, the vector is decompressed on demand or mathematically absorbed into Q's projection matrices.

For this to work, MLA requires **decoupling Rotary Position Embedding (RoPE)** from the latent vector, since RoPE depends on the token's absolute position and cannot be compressed alongside semantic content.

The results are remarkable: MLA achieves up to **93.3% memory reduction** relative to MHA while matching or even surpassing its quality. Other frontier models like **Kimi K2** and **GLM-5** are already adopting this architecture.

A recent research line, **MHA2MLA**, proposes converting existing MHA-trained models (like Llama) to the MLA architecture without retraining from scratch, using matrix factorizations (SVD) with only ~0.5% fine-tuning data.

### KV cache quantization

Another complementary approach is reducing the **numerical precision** of stored data. Instead of storing vectors in 16 bits (FP16/BF16), they are compressed to 8, 4, or even 2 bits. Memory reduction is nearly proportional to the bits trimmed.

This technique is **orthogonal** to architectural modifications, meaning it can be combined with GQA or MLA to multiply the benefits.

Notable methods:

- **KIVI (ICML 2024):** Enables asymmetric 2-bit cache quantization without retraining, applying per-channel quantization to Keys and per-token quantization to Values. Achieves **2.6x less peak memory**, up to **4x larger batch sizes**, and **2.35-3.47x throughput** improvement.
- **TurboQuant (Google):** Uses orthogonal rotations based on the Johnson-Lindenstrauss algorithm to achieve 3-4 bit quantization with near-zero precision loss, approaching the theoretical compression limit.

### Token eviction and dynamic compression

The third family of techniques is based on an empirical observation: **not all context tokens are equally important** for predicting the next word. Models tend to pay massive attention to certain "anchor tokens" (attention sinks) and recent local tokens, while intermediate tokens receive little attention.

Eviction techniques **discard irrelevant tokens from the cache** and retain a fixed budget of high-importance tokens (Heavy Hitters) or tokens within a local window.

Notable approaches:

- **H2O and StreamingLLM:** Pioneers in keeping only the initial tokens (attention sinks) alongside the most relevant recent tokens. StreamingLLM (ICLR 2024) demonstrated stable generation beyond **4 million tokens** with a **22.2x speedup** over sliding window recomputation, requiring no fine-tuning.
- **SnapKV and PyramidKV (2024):** Compress the KV cache during the prefill phase using an observation window at the prompt's tail to identify important KV positions per attention head. SnapKV achieves **3.6x faster decoding** and **8.2x memory improvement**, processing up to **380K tokens on a single A100-80GB GPU**. PyramidKV goes further by reducing the number of stored tokens in deeper model layers, where attention diversity is lower.
- **Ada-KV and FastKV (2024-2025):** Ada-KV assigns **adaptive per-head memory budgets** instead of uniform ones. FastKV decouples context reduction from cache compression, selectively propagating tokens across layers to accelerate both prefill and decoding.

## Summary table

| Technique | Type | Memory savings | Status |
|-----------|------|---------------|--------|
| MQA | Architecture | ~87.5% | Superseded |
| GQA | Architecture | ~75% | Industry standard |
| MLA | Architecture | ~93% | State of the art |
| KIVI (2-bit) | Quantization | ~87.5% | In production |
| TurboQuant | Quantization | ~75-81% | Active research |
| H2O/StreamingLLM | Eviction | Variable | In production |
| SnapKV/PyramidKV | Eviction | Variable | Active research |
| Ada-KV/FastKV | Eviction | Variable | Active research |

## Conclusion

The KV cache is one of those optimizations that is invisible when it works correctly, but whose absence would make text generation impractical. It is, in essence, the model's **short-term memory** during inference.

The current challenge is not whether to use it (it is indispensable), but how to manage its memory growth as contexts lengthen and batching intensifies. The three optimization families (architecture, quantization, and eviction) do not compete with each other but complement one another: a modern model can use GQA or MLA as its base, apply 4-bit quantization on the resulting cache, and also implement dynamic eviction of irrelevant tokens.

The KV cache is, today, the field where most LLM inference optimization efforts converge. And understanding it is key to grasping both the limits and possibilities of current language models.
