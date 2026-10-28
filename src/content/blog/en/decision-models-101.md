---
idx: 6
title: "Decision Models: When We Ask AI to Decide, Not to Write"
author: "Guillermo"
pubDate: "October 28th, 2026"
pubDateLogical: "2026-10-28"
tags: ["AI", "LLMs", "Decision Models", "Calibration"]
---

Imagine you run a support system and want an AI to decide which team each ticket goes to. You hand a chatbot the message _"Help! My payouts have been failing for 3 days"_ and it replies with something like: _"This looks like a payments issue, so it should probably go to the billing team, although it could also be a technical failure..."_.

The answer is correct. And, at the same time, pretty useless for your code. What your code needs is to fill this in:

```python
team = ???
if team == "billing":
    send_to_billing(ticket)
```

To get there you have to interpret free text, guess whether that _"probably"_ means 60% or 95%, and accept that tomorrow the same question may come back worded differently. LLMs are optimized to talk to people, but a lot of software needs something else: **small, fast, reliable decisions**.

In September 2026 a new category of models appeared that is built for exactly that: **decision models** (or _System One models_). In this post I summarize what they are, how they work under the hood, how they are trained so their probabilities are honest, and when it makes sense to use them. It is the written version of my talk [Decision Models 101](/talks/decisions-models-101/) (slides in Spanish).

## Thinking, fast and slow

The name _System One_ comes from the System 1 popularized by Daniel Kahneman in _Thinking, Fast and Slow_: the fast, intuitive mode of thinking (recognizing a face, noticing someone is angry), as opposed to System 2, slow and deliberate (filing your taxes).

- **System 2: LLMs and reasoning models.** They write, explain, plan and code. They generate the answer word by word and take seconds.
- **System 1: decision models.** They make one concrete judgment with the information in front of them, choosing among answers you define. They take tens or hundreds of milliseconds.

A decision model makes the "one second" call an expert would make with the context in front of them. That is why not every question works:

- **Good question:** "Does this message convey urgency?"
- **Bad question:** "Analyze the message and decide what to do."

The second one is not bad because it is hard, but because **it is not a closed decision**. It needs to be split into smaller questions.

## Two weeks that created a category

It all happened very quickly:

| Date (approx.) | Milestone                | What it brings                                                                                                          |
| -------------- | ------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| Sep 15, 2026   | **Jev**, by TypeSafe     | Defines the category and the API. Closed: publishes neither architecture nor size, only the name of its training method |
| Sep 17, 2026   | **Kev** (open source)    | A frozen Qwen LLM with an adapter and a decision head. Jev-compatible API                                               |
| Sep 18, 2026   | **Laya** (open source)   | A BERT-style encoder that decides in a single pass                                                                      |
| Sep 21, 2026   | **CLM** (open source)    | A contrastive approach: state and options in the same vector space                                                      |
| Sep 29, 2026   | **OpenAI Decisions API** | Announced at DevDay on top of GPT-6 Luna, in limited preview                                                            |

The pattern is interesting: a closed pioneer defines the idea, within days open alternatives show up publishing weights and recipes, and finally the biggest player in the industry launches its own version. Since Jev and OpenAI are black boxes, **the open alternatives are our window** into how these models probably work inside.

## The contract: state, questions and answers

The whole category boils down to one formula:

```text
decision = f(state, questions)  →  typed answer + probabilities
```

- **State:** the context being evaluated, as text or JSON. A ticket, an order, an email, a game scene...
- **Questions:** one or more, each with its type, its instructions and, above all, **the possible answers**. You define them, and the model cannot step outside them.
- **Answers:** for each question, the chosen option, **the probability of every option**, and a confidence measure. Ready to use in code.

A useful analogy: it is a multiple-choice form the model fills in, but it also tells you how sure it is about every box.

### Choice, score and noul

There are three question types, shared by every model (they all copy TypeSafe's contract):

| Type     | Example question                | What it returns                                             |
| -------- | ------------------------------- | ----------------------------------------------------------- |
| `choice` | Which team should handle it?    | The chosen option and one probability per option            |
| `score`  | How frustrated is the customer? | A position on an ordered scale (it can land between levels) |
| `noul`   | Does it convey urgency?         | The probability of "yes", between 0 and 1                   |

"Noul" is TypeSafe's name for yes/no questions.

### One request, every answer

The API, `POST /v1/systemone`, works almost like a standard: Kev, Laya and CLM accept the same fields, so switching providers usually means changing the URL and the model name. This is a real example from Jev's public documentation, with all three questions in the same request:

```json
{
  "model": "jev-latest",
  "state": "Help! My payouts have been failing for 3 days.",
  "questions": {
    "is_urgent": {
      "type": "noul",
      "instructions": "Does this convey urgency?"
    },
    "department": {
      "type": "choice",
      "instructions": "Which team should handle this?",
      "criteria": {
        "billing": "Payments, invoicing, refunds",
        "technical": "Bugs, outages, integrations",
        "sales": "Pricing, upgrades, new accounts"
      }
    },
    "frustration": {
      "type": "score",
      "instructions": "How frustrated is the customer?",
      "criteria": ["Calm", "Frustrated", "Very angry"]
    }
  }
}
```

And the response (trimmed):

```json
{
  "model": "jev-1.13.0",
  "answers": {
    "is_urgent": { "type": "noul", "noul": 0.95 },
    "department": {
      "type": "choice",
      "choice": "billing",
      "confidence": 0.8,
      "probabilities": { "billing": 0.87, "sales": 0, "technical": 0.13 }
    },
    "frustration": {
      "type": "score",
      "score": 1.04,
      "confidence": 0.94,
      "probabilities": { "0": 0, "1": 0.96, "2": 0.04 }
    }
  },
  "usage": { "input_tokens": 426, "output_tokens": 73 }
}
```

How to read it: it is urgent (0.95), it goes to billing with confidence 0.8 (although there is a 13% chance it is a technical issue, and sales is ruled out), and the customer is "frustrated", not "very angry" (score 1.04). Also look at the usage: almost all the cost is in **reading**. In Jev, in fact, output is free.

## Under the hood: generating vs. deciding

The key difference with an LLM lies in how the answer is produced. An LLM generates **autoregressively**: every word requires a full pass through the model, and on each pass the next word is picked, often with some randomness. A decision model makes **a single pass**, and every probability comes out of it at once.

![Generating word by word vs. deciding in one go](/images/blog/decision-models-generate-vs-decide.svg)

That is where three of their advantages come from: speed, low cost and repeatability. And a fourth one: since the model can only choose among the options you gave it, **the output cannot have formatting errors**.

### The shared architecture

Each project is built differently, but they all share the same blueprint:

![The shared architecture of decision models](/images/blog/decision-models-architecture.svg)

1. **Tokens.** The state and each question are split into tokens, just like in any LLM.
2. **Pretrained backbone.** A regular language model, the one that "knows how to read". It is usually frozen or nearly so.
3. **Latent state.** The result of reading the state: vectors that summarize what the model understood. It is computed **only once**.
4. **Question and options.** Each question, with its options, is processed by reading that latent state.
5. **Decision head.** The only truly new piece: a small component that, instead of predicting the next word, **compares the question with each option** and gives it a score.
6. **Softmax.** The scores become probabilities that add up to 1, and the server returns the JSON.

### One state, many questions

Since the state is read once, adding questions costs very little. Moreover, each question sees the state and itself, but **never the others**: asking "is it urgent?" does not influence the answer to "which team?". Kev measures that asking questions together or separately yields practically identical probabilities (differences in the millionths in fp32).

This enables a pattern TypeSafe calls _speculative fan-out_: ask "too many" questions just in case and let your code use only what it needs. According to their docs, in an example with 13 questions about the same text, batching them in one call was **12.2 times cheaper and 10 times faster** than one call per question.

### Three ways to build it

The open models show three different ways of implementing the same idea:

| Model            | How it is built                                                                                                                                    | Intuition                                          |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| **Kev**          | A frozen Qwen LLM (0.8B to 27B) with a small LoRA adapter and a _pointer head_ that compares the question's vector with each option's vector       | "Points" at the right option                       |
| **Laya**         | A BERT-style encoder (~0.3–0.4B) that reads state and questions together, in both directions, with one head per question type. ~33 ms per question | "Reads everything at once and fills in the form"   |
| **CLM**          | A frozen Qwen3-8B with two projections that map state and options into the same vector space. The option closest to the state wins                 | "Finds the action that best matches the situation" |
| **Jev / OpenAI** | Not published. **We assume** something similar: a large base model, post-trained to decide and calibrated                                          | Black box                                          |

A practical detail about CLM: since state and options are encoded separately, option vectors can be precomputed, which lets it choose among a huge number of candidates (its model card mentions around 1,000) very fast.

The common denominator is clear: **a pretrained language model acts as the reader and a small head scores the options** instead of generating text.

## How they are trained

No decision model is trained from scratch. With variations, they all follow the same three-step recipe:

1. **Learn to read.** Start from a language model already pretrained on huge amounts of text, which already understands language and knows things about the world. Kev and CLM use Qwen; Laya uses ModernBERT and mmBERT; OpenAI says it uses GPT-6 Luna, and TypeSafe does not say.
2. **Learn to decide.** Teach it examples of _(state, question, correct answer)_ from public datasets and synthetic data. The scales vary enormously: around 12,600 examples for Kev versus tens of millions for CLM. Jev's data is reportedly 100% synthetic, according to an interview with its creator.
3. **Learn to be honest.** Tune it so its probabilities tell the truth: if it says 80%, it should be right 80% of the time. This is the step that sets them apart the most.

### RLHF, RLVR and RLCD

Every modern model goes through post-training with reinforcement learning. What changes is **what gets rewarded**:

|             | RLHF                                                           | RLVR                                             | RLCD                                                           |
| ----------- | -------------------------------------------------------------- | ------------------------------------------------ | -------------------------------------------------------------- |
| Rewards...  | answers a person likes                                         | answers that are verifiably correct              | stated probabilities that match reality                        |
| Produces    | Chatbots (ChatGPT)                                             | Reasoning models                                 | Decision models                                                |
| Side effect | Sycophancy and **overconfidence**: sounding sure scores better | Slow and expensive: they reason before answering | They don't generate text: they only decide                     |
| Analogy     | The student who says what the teacher wants to hear            | The student who solves the problem step by step  | The weather forecaster whose "70%" days rain 7 times out of 10 |

TypeSafe's argument is that RLHF teaches models to sound convincing, because confident answers please evaluators more. And something can be convincing without being reliable enough to automate without supervision. RLCD (_Reinforcement Learning for Calibrated Decisions_) changes the goal: it rewards stating the right probability, not sounding sure.

An important caveat: the name was coined by TypeSafe and its exact recipe **is not public**. There is no paper and no published reward function. Laya is the only open implementation that claims to use it.

### The honest bet

How do you reward "stating the right probability"? With an elegant mathematical trick: **proper scoring rules**.

Imagine you are a weather forecaster and you know there is a real 70% chance of rain tomorrow. You are penalized with the **Brier rule**: if it rains, you pay (1 − p)²; if it doesn't, you pay p², where p is the probability you announce. What should you say?

| What you announce | Expected penalty                   |
| ----------------- | ---------------------------------- |
| 100% (exaggerate) | 0.7 × 0² + 0.3 × 1² = 0.30         |
| 50% (hedge)       | 0.7 × 0.5² + 0.3 × 0.5² = 0.25     |
| 70% (the truth)   | 0.7 × 0.3² + 0.3 × 0.7² = **0.21** |

![The honest bet: the expected penalty is only minimal when telling the truth](/images/blog/decision-models-honest-bet.svg)

The curve has a single minimum, and it lands **exactly on the truth**. That is what it means for a rule to be _strictly proper_: the only way to get the best expected score is to state the probability you really believe. If you train a model with a reward like that, **lying never pays off**.

With one caveat: the rule guarantees that honesty is the optimum, but whether the model actually reaches that optimum depends on the data and the training. With finite data or distribution shifts, calibration can end up imperfect.

### The confidence thermostat

The second mechanism is much simpler: **temperature scaling**. The head scores the options and a softmax turns those scores into probabilities. If you divide the scores by a temperature T > 1 before the softmax, the probabilities get softer and the model stops being "too sure".

The nice part is that **the order never changes**: temperature never alters which option wins, only how much certainty it expresses. It is tuned on held-out data the model never saw during training. Each Kev checkpoint ships its own, between 1.32 and 2.41.

## What being calibrated means

A model is calibrated if, across many of its answers, the ones it gives at 80% are right about 80% of the time, the ones at 20% are right about 20% of the time, and so on.

You measure it by grouping thousands of answers by stated confidence and checking how many were right in each group. A calibrated model sits on the diagonal of the **reliability diagram**; an overconfident one falls below it. The average distance to that diagonal is the **ECE** (_Expected Calibration Error_). Some published figures:

- **Kev-9B:** with temperature, ECE drops from 0.103 to 0.041, and "very confident" errors (probability ≥ 0.9) go from 8.2% to 2.4% (Jev: 3.7%).
- **Laya:** after tuning temperatures, mean ECE drops from 0.466 to 0.081.

Beware: **calibration is a property of groups of answers**. It does not guarantee that a specific answer at 0.9 is correct; it guarantees that out of every ten answers at 0.9, roughly one is wrong. And calibration is not the same as accuracy: a model that is right 90% of the time but always says 99% is useless for setting thresholds; one that says 70% when it is right 70% of the time is useful.

### From probabilities to confidence

Besides probabilities, `choice` and `score` answers include a `confidence` field that sums up the distribution in a single number. For `choice`, TypeSafe's formula is:

```text
confidence = (p_max − 1/n) / (1 − 1/n)
```

It is 1 if all the probability sits on one option and 0 if it is spread evenly across the n options. With (0.6, 0.3, 0.1), for instance, you get 0.4. For `noul` it is not needed: the probability already says it all, although you can use |2p − 1| to put it on the same scale.

This is what makes calibration useful: **the model can say "I'm not sure"**, and the software can react.

## Advantages over an LLM

Why not just use an LLM and ask it for JSON? Because it is not the same:

|                | LLM with JSON mode                               | Decision model                                                      |
| -------------- | ------------------------------------------------ | ------------------------------------------------------------------- |
| Output         | JSON-shaped text: it has to be validated         | A value from the set you define: impossible to step outside         |
| Probabilities  | Not exposed or unreliable; tends to sound sure   | Calibrated, on every answer and for every option                    |
| Repeatability  | Sampling: the same question may vary             | No sampling: same input, same probabilities                         |
| Speed          | One to several seconds                           | Tens to hundreds of ms (Jev: 70–500 ms; OpenAI: ~150 ms vs. ~1.6 s) |
| Cost           | You pay for input and every generated token      | Almost all of it is input (in Jev, output is free)                  |
| Many questions | One after another, or mixed into the same prompt | In parallel and isolated, over a single read of the state           |

There are two caveats about repeatability. Serving the model in bf16 instead of fp32 shifts probabilities slightly (according to Kev, by up to about 0.03, and the winning option changes in one out of 300 questions). And an alias like `jev-latest` may start pointing to another version without notice, so in production you should pin the version.

Do they hallucinate? They cannot invent an answer outside the options. They can, however, **be wrong** by picking the incorrect option, and that is what confidence is for.

## Advantages over a classic classifier

If an LLM is generalist, slow and expensive, a classic classifier is the opposite: specialized, fast and cheap. Decision models sit in between and take the best of both:

- **One model for many tasks.** With a classic classifier you collect data, label it, train and deploy a model per task. Here, the question and options travel in the request.
- **A new category?** With a classifier, retrain. Here, add a line to the JSON.
- **They generalize to tasks they haven't seen** (_zero-shot_), because they inherit language understanding from a large model.

The honest caveat is that open models are, for now, less capable than Jev overall. Laya, for example, performs close to chance on new tasks until it is fine-tuned. But that is precisely the point: **they can be fine-tuned**, and it pays off. With 5,219 real labeled claims, Kev-4B went from 0.804 to 0.904 accuracy, and an example fine-tune takes about 15 minutes on an H100.

Jev, on the other hand, cannot be fine-tuned: the same weights serve every customer and it adapts to each case only through the state, the instructions and each question's criteria. It is the classic trade-off between closed (more capable, hands-off) and open (less capable, but adaptable and deployable on your own infrastructure).

## In practice

### Confidence picks the path

The star pattern is **confidence-gated routing**. The answer says _what_ to do; the confidence says _whether to act_:

| Confidence | What the system does                                             |
| ---------- | ---------------------------------------------------------------- |
| High       | Act automatically                                                |
| Medium     | Ask for confirmation, flag for review or gather more information |
| Low        | Don't act: hand off to a person or a reasoning LLM               |

Thresholds depend on the risk of each action; they are not a global number: showing the wrong balance can be fixed, approving the wrong transfer not so much. **That criterion is set by your code, not by the model.** The sensible approach is to start with conservative thresholds and tune them by measuring on your own data.

To get a sense of how much can be automated: according to Kev's README, tolerating a 5% error rate, Jev automatically resolves 70% of decisions on sources it never saw during training, and Kev-4B, 9B and 27B between 52% and 69%.

### A live example: the Chrome dinosaur

For the talk I built a demo where a decision model plays the Chrome dinosaur game. At every moment the scene is described in text and the model gets a `choice` question with three options: `jump`, `duck` and `nothing`. None of the models were trained for this game.

![Kev-9B playing the Chrome dinosaur game: the scene, the text state, the decision history and the probability of each action](/talks/decisions-models-101/assets/img/juego-kev9b.png)

Kev-9B jumps with a probability of 0.98 (confidence 0.97). Kev-0.8B, a model ten times smaller, hesitates: 0.55 versus 0.33.

![Kev-0.8B hesitating: probabilities almost split between jumping and doing nothing](/talks/decisions-models-101/assets/img/juego-kev0_8b.png)

Its confidence of 0.33 is its way of saying **"I'm not sure about this"**, and that is useful information: a real system could, in that case, hold off or delegate to another component. Confident does not mean infallible, but a model that knows when it is unsure is much easier to integrate than one that always sounds convinced.

### When to use them and when not to

**Good fits:**

- Classifying and routing tickets, emails and cases.
- Triage and prioritization.
- Guardrails on the input and output of an LLM.
- Choosing an agent's next step or tool.
- Checking whether a document says something.

**Not what they are for:**

- Writing, summarizing or explaining.
- Multi-step reasoning.
- Open-ended or poorly scoped questions.
- Critical decisions without human oversight.

**Handle with care:**

- **Option order can matter.** Kev, Laya and the analyses of Jev document it; the usual mitigation is to rotate the order and average.
- **They work best in English.**
- **Very long contexts or many options.** Laya, for example, loses accuracy beyond about 20 options.
- **A question and its negation can both return 0.7.** There is no guaranteed consistency across different questions.
- **Measure on your own data** before setting thresholds.

A rule of thumb: if an expert would decide it **in one second** with the information in front of them, it is a good candidate. If they would need to think it over for a while, split the question or use an LLM.

### How they fit with the rest of the system

Four common patterns:

1. **Speculative fan-out.** Ask all the questions that _might_ be needed in one go. It costs almost the same as asking one.
2. **Confidence-gated routing.** Automate, confirm or escalate depending on confidence.
3. **Composite scoring.** Break a complex judgment into atomic questions and combine them in code, with weights you control.
4. **System 1 → System 2 cascade.** The decision model handles the easy and fast cases; the doubtful ones go to a reasoning LLM or a person.

The golden rule is that **code is in charge**. The model brings common sense at specific points, but the flow, the rules and the permissions stay in the software. It should never be your authorization layer.

## Who's who

| Model         | Who                  | Access                | Inside                                       | Calibration        | Fine-tunable?               |
| ------------- | -------------------- | --------------------- | -------------------------------------------- | ------------------ | --------------------------- |
| Jev           | TypeSafe             | Paid API              | Not published                                | RLCD               | No (state and instructions) |
| Kev           | `jaredpalmer/kev`    | Open · Apache-2.0     | Frozen Qwen + LoRA + pointer head · 0.8B–27B | Tuned temperature  | Yes                         |
| Laya          | `NandhaKishorM/laya` | Open · Apache-2.0     | ModernBERT or mmBERT encoder · ~0.3–0.4B     | RLCD + temperature | Yes                         |
| CLM           | `Contrastive-LM`     | Open · Apache-2.0     | Frozen Qwen3-8B + 2 projections              | Contrastive        | Yes (heads)                 |
| Decisions API | OpenAI               | API · limited preview | Specialized version of GPT-6 Luna            | Not published      | Not announced               |

A warning: each project's performance figures are not comparable with each other, because each one is evaluated on its own benchmarks. And they are all as published by their authors; nobody has reproduced them independently.

## Conclusion

If I had to keep three ideas:

1. **They don't write, they decide.** They read like an LLM, but answer by choosing among options you define, in a single pass.
2. **They tell you how much they know.** Their probabilities are trained to be honest, and that lets you automate with thresholds: act, confirm or escalate.
3. **They sit between the classifier and the LLM.** They generalize without per-task training and, the open ones, can be fine-tuned to your case.

Decision models don't replace LLMs: they complement them. The decision model takes the closed, frequent decisions, and the LLM is reserved for writing, reasoning or resolving the doubtful cases. After a few years of trying to make LLMs do absolutely everything, it is refreshing to see a category of models that does one thing, does it fast and, above all, tells you when it isn't sure.

## Further reading

- [TypeSafe · Introducing System One models & Jev](https://typesafe.ai/blog/introducing-system-one-models-and-jev)
- [TypeSafe · System One](https://docs.typesafe.ai/concepts/system-one.md), [AI primer (RLHF, RLVR, RLCD)](https://docs.typesafe.ai/introduction/machine-learning-primer.md) and [Confidence](https://docs.typesafe.ai/confidence.md)
- [Cloudflare Workers AI · Jev](https://developers.cloudflare.com/ai/models/typesafe/jev/) (JSON examples)
- [RLCD explained: what is known and what isn't](https://systemonemodels.org/guides/rlcd-explained/)
- [jaredpalmer/kev](https://github.com/jaredpalmer/kev), [NandhaKishorM/laya](https://github.com/NandhaKishorM/laya) and [Contrastive-LM/CLM-v0.1-8B](https://huggingface.co/Contrastive-LM/CLM-v0.1-8B)
- [The Decoder · DevDay 2026 and the Decisions API](https://the-decoder.com/openai-expands-codex-and-its-api-at-devday-with-security-scans-a-decisions-api-and-ultrafast/)
- [The talk slides](/talks/decisions-models-101/) (in Spanish)
