---
idx: 8
title: "All Models See the Same World: The Platonic Representation Hypothesis Becomes a Theorem"
author: "Guillermo Segovia"
pubDate: "November 3rd, 2026"
pubDateLogical: "2026-11-03"
tags: ["AI", "LLMs", "JEPA", "World Models"]
---

A 109-million-parameter text model that has **never seen an image** organizes meaning more like a vision model than Qwen2.5-72B does, an LLM roughly 660 times larger. And it reaches that level of alignment with **42 times less data** than a model of the same size trained like an LLM.

That is the headline result of _Proving and Improving the Platonic Representation Hypothesis with JEPAs_, a preprint published on October 29th, 2026 by Randall Balestriero (Brown) and Yann LeCun (NYU), both also affiliated with AMI Labs. The press has framed it as "LeCun's paper", but Balestriero is the first author. Behind the numbers sits a question AI has been asking for more than a decade: **are all models learning the same thing?**

In this post I cover where that question comes from, what the paper proves, what it does not prove yet, and why it matters for the debate between scaling LLMs and building world models. It is the written version of my talk [Todos los modelos miran el mismo mundo](/talks/PRH-with-JEPA/) (slides in Spanish).

## A map of the world inside every model

A model stores what it learns as points in a space: every word, image, or sentence gets a set of coordinates (its _embedding_), and similar things end up close together. Nobody tells it that "dog" and "puppy" are alike; it figures that out from the data. The whole set of points is its **representation**, its map of the world.

The question is whether two different models draw the same map. The clues have been piling up:

| Year | Work                            | What it showed                                                                                                  |
| ---- | ------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| 2013 | Mikolov, Le and Sutskever       | Word spaces of two languages, trained separately, match through a linear transformation: almost 90% precision@5 |
| 2017 | Conneau et al. (MUSE)           | That mapping can be found **without a dictionary**, using only the shape of the point clouds                    |
| 2021 | CLIP (OpenAI)                   | Images and text are aligned by training them **together** on 400 million image–caption pairs                    |
| 2024 | Huh et al., Platonic Hypothesis | Vision and language models trained separately look more alike the better they get                               |
| 2026 | Gröger et al.; You et al.       | Critiques: once the metric is calibrated, local neighborhoods match, global geometry much less so               |

Huh, Cheung, Wang and Isola (MIT) framed it as a hypothesis: models _"are converging to a shared statistical model of reality"_. The name comes from Plato's cave: images and text would be different shadows of the same world, and models, as they improve, would reconstruct that shared world.

But it was an observation, not a law. The highest alignment they measured was around 0.16 out of 1, there was no proof of why it happened, and the only known lever was scale. It fit nicely with the industry's dominant bet since the 2020 scaling laws: more parameters, more data, and an understanding of the world would follow.

## Two ways to learn: predict the data or its meaning

To understand the paper you need the alternative LeCun has been championing since 2022. An LLM learns to **predict the exact next token**: to get "beach" right instead of "sand", it has to model everything, including the author's style and specific wording.

A **JEPA** (_Joint-Embedding Predictive Architecture_) does something else. It takes two views of the same thing, runs them through an encoder, and predicts the **representation** of one from the other, not the raw data. That lets it ignore what is unpredictable. It also needs an "anti-collapse" term, because the trivial solution would be to map everything to the same point. LeCun has spent four years building on this idea: I-JEPA (2023) for images, V-JEPA 2 (2025) for video and robotics, and LeJEPA (2025), co-authored by Balestriero, which gives it a cleaner theoretical footing.

## The key: what you tell the model is "the same"

The paper's contribution is to pin down the variable that decides what a JEPA learns: the **positives**, the pairs of data we tell it represent the same thing.

- **Good views:** two different observations of the same scene. Two photos of the same place, or two different captions of one image. The only thing they share is the world.
- **Bad views:** two corruptions of a single observation, such as masking words in a sentence or cropping the same photo. They share the scene, but **also** the wording, the style, or the framing. The paper calls this _nuisance_.

An analogy: learning to recognize a person from photos taken on different days, versus from crops of a single photo. In the second case you also learn the T-shirt they happened to be wearing that day.

![Diagram from the paper: a scene with a cone and a sphere produces two photos and two captions; two JEPAs trained on good views reach the same representation up to a rotation](/talks/PRH-with-JEPA/assets/img/fig1-mundo-vistas.png)

With that distinction, the authors prove the **Platonic Representation Theorem**: two JEPAs trained separately, in any modality, using good views reach the same embedding at their optimum **up to a rotation**. It is exactly the rotation Mikolov found between languages in 2013, now proven and with conditions attached. A second theorem bounds the error when the views are not perfect: the worse they are, the larger the misalignment.

## Next-token prediction, a JEPA with bad views

The paper goes one step further, and this is what makes it relevant beyond academia. It shows that the loss used to train an LLM literally has the shape of a JEPA (Proposition 4): a prediction term and an anti-collapse term. Its two views are a prefix and its continuation within the **same document**, so they share author and style. They are bad views.

The consequence is that an LLM spends part of its capacity on details of its own modality that no rotation can align with an image. The authors measure it as the fraction of the representation explained by the scene:

![Fraction of the representation explained by the scene: 0.804 with good views, 0.655 with bad views and 0.608 with next-token prediction](/images/blog/platonic-scene-fraction.svg)

One important caveat: the link between next-token prediction and the third theorem is heuristic, and the paper itself presents it as _"a prediction to test rather than a corollary"_.

## The evidence: 42 times fewer samples

The experiments compare a 109-million-parameter text encoder trained three ways on the same corpus. The metric is the one from Huh et al.: for each caption, take its 10 nearest neighbors in the text space and the 10 of its image in the space of DINOv2, a vision model, and count how many overlap.

![Figure 1 from the paper: alignment with DINOv2 versus training samples; the good-view JEPA reaches with 21.6 million samples what next-token achieves with 900 million](/talks/PRH-with-JEPA/assets/img/fig1-42x.png)

With good views, the model reaches with 21.6 million samples the alignment that next-token prediction achieves with 900 million. With full training it hits 0.184, above LLMs that have read between 15 and 18 trillion tokens, compared with the JEPA's 116 billion:

![Alignment with DINOv2: 109M good-view JEPA 0.184; Qwen2.5-72B 0.154; Llama-3-70B 0.151; CLIP text 0.124; 109M next-token 0.111; bad-view JEPA 0.088](/images/blog/platonic-alignment-comparison.svg)

The fact that a rotation is enough has practical uses. The authors build a captioner that connects a frozen vision model to a text decoder, where the only thing fitted on image–text pairs is a rotation matrix: it reaches a CIDEr of 0.838 on COCO. And with no pairs at all, finding the rotation from the geometry of the point clouds alone, they get 64.4% top-5 accuracy on ImageNet-100, versus the best reported 56% with language models of up to 8 billion parameters.

## The fine print

This is what separates a solid result from a headline, and the paper spells it out itself:

- **An idealized world.** The theorem assumes a finite world, lossless observations, and models at their optimum. Real modalities lose information.
- **Borrowed good views.** For web text, the good views are captions generated by LLaVA, a model that already contains CLIP. Some image–text information leaks in indirectly: without that captioner, alignment drops from 0.107 to 0.060.
- **Aligning is not reasoning.** The JEPA wins on alignment with vision, not on conversation, code, or reasoning, which the paper does not measure. And the absolute margins are modest.
- **No replication.** It is a preprint without peer review, signed by JEPA's main proponents. The code is public and ships with a guide to reproduce every number, but as of November 3rd nobody has done so yet.

## Beyond scale: the bet on world models

The sentence from the abstract that sums up the thesis is _"Positive views, and not scale alone, are thus the lever to build platonic representations"_. It is worth reading in full: it does not say scale does not matter, only that it is neither the only lever nor the most efficient one for aligning with the world.

The paper fits LeCun's agenda, which holds that _"real intelligence does not start in language. It starts in the world"_. That is the thesis behind AMI Labs, headquartered in Paris, which according to the press closed a $1.03 billion seed round in March 2026, a figure the company does not confirm on its website. If next-token prediction is a JEPA with bad views, learning from many observations of the same world (video, audio, actions) would be the most efficient route. That is the authors' reading, not an established fact.

It is not the only bet on world models:

| Project | Who              | Approach                                                                                           |
| ------- | ---------------- | -------------------------------------------------------------------------------------------------- |
| JEPA    | AMI Labs (LeCun) | Non-generative: predicts representations. V-JEPA 2 already plans the movements of a robotic arm    |
| Genie 4 | Google DeepMind  | Generative: simulates interactive worlds in real time with audio. Research preview, Oct 27th, 2026 |
| Marble  | World Labs       | Generative: creates exportable 3D worlds from text, images, or video. November 2025                |

The industry agrees on the diagnosis, that the physical world matters, but not on the method.

There is an economic and geopolitical reading I find relevant. The race to scale favors whoever has the most capital, the most data centers, and the most energy, a race led today by a handful of American and Chinese companies. If part of the lever shifts to **data design** rather than raw compute, the playing field opens up to smaller labs and to regions with less financial muscle, such as Europe. It is no coincidence that one of the most visible bets on this path is based in Paris. That said, it remains a hypothesis that depends on the results being replicated and scaling beyond alignment benchmarks.

## Conclusion

If I had to keep three ideas:

1. **From intuition to theorem.** That different models converge to the same map of the world is now proven for JEPAs, under idealized assumptions.
2. **The lever is the views, not just scale.** Next-token prediction learns from bad views, which is why it needs far more data to align with vision.
3. **An argument for world models.** It backs the bet on learning from many observations of the same world. It still needs independent replication.

My reading is that the paper does not announce the end of LLMs, which remain excellent at language, code, and reasoning. What it does change is the question. For years, the conversation about improving models has revolved around how many parameters, how many tokens, and how many gigawatts. This work proposes a cheaper and, in my view, more interesting one: **what do we tell the model is the same?**

## Further reading

- [The talk slides](/talks/PRH-with-JEPA/) (in Spanish)
- ["Captions Without Pairs" demo on Hugging Face](https://huggingface.co/spaces/galilai-group/prh_demo)
- [The paper's code: galilai-group/prh-proof](https://github.com/galilai-group/prh-proof)
- [KV Cache: The Hidden Memory Powering LLMs](/blog/kv-cache-in-llms), to better understand how an LLM works under the hood

## References

- [arXiv · Balestriero and LeCun, Proving and Improving the Platonic Representation Hypothesis with JEPAs (Oct 29th, 2026)](https://arxiv.org/abs/2610.39302)
- [GitHub · galilai-group/prh-proof](https://github.com/galilai-group/prh-proof)
- [Hugging Face · Captions Without Pairs (demo)](https://huggingface.co/spaces/galilai-group/prh_demo)
- [arXiv · Mikolov, Le and Sutskever, Exploiting Similarities among Languages for Machine Translation (2013)](https://arxiv.org/abs/1309.4168)
- [arXiv · Conneau et al., Word Translation Without Parallel Data (2017)](https://arxiv.org/abs/1710.04087)
- [arXiv · Radford et al., Learning Transferable Visual Models From Natural Language Supervision (CLIP, 2021)](https://arxiv.org/abs/2103.00020)
- [arXiv · Huh, Cheung, Wang and Isola, The Platonic Representation Hypothesis (2024)](https://arxiv.org/abs/2405.07987)
- [arXiv · Gröger, Wen and Brbić, An Aristotelian View (2026)](https://arxiv.org/abs/2602.14486)
- [arXiv · You et al. (2026)](https://arxiv.org/abs/2609.27252)
- [arXiv · Kaplan et al., Scaling Laws for Neural Language Models (2020)](https://arxiv.org/abs/2001.08361)
- [arXiv · DINOv2 (2023)](https://arxiv.org/abs/2304.07193)
- [OpenReview · LeCun, A Path Towards Autonomous Machine Intelligence (2022)](https://openreview.net/forum?id=BZ5a1r-kVsf)
- [arXiv · I-JEPA (2023)](https://arxiv.org/abs/2301.08243)
- [arXiv · V-JEPA 2 (2025)](https://arxiv.org/abs/2506.09985)
- [arXiv · LeJEPA (2025)](https://arxiv.org/abs/2511.08544)
- [arXiv · Schnaus, Araslanov and Cremers, It's a (Blind) Match! (CVPR 2025)](https://arxiv.org/abs/2503.24129)
- [AMI Labs · Official website](https://amilabs.xyz)
- [Tech.eu · Yann LeCun's Paris-based AI world model startup raises more than $1bn (Mar 10th, 2026)](https://tech.eu/2026/03/10/yann-lecun-s-paris-based-ai-world-model-startup-raises-more-than-1bn/)
- [Google DeepMind · Genie 4: a new generation of world simulation (Oct 27th, 2026)](https://deepmind.google/blog/genie-4-a-new-generation-of-world-simulation/)
- [World Labs · Marble](https://www.worldlabs.ai/blog/marble-world-model)
- [AICoder · LeCun and Balestriero JEPA Platonic Representation Theorem (Oct 29th, 2026)](https://aicoder.com/news/news-20261029-lecun-balestriero-jepa-platonic-representation-theorem-109m-text-jepa-beats-72b-llms-alignment)
- [Talk · Todos los modelos miran el mismo mundo](/talks/PRH-with-JEPA/)
