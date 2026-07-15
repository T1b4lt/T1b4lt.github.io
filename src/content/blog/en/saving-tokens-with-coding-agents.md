---
idx: 5
title: "Stop Burning Tokens: Three Strategies for Coding Agents"
author: "Guillermo"
pubDate: "July 15th, 2026"
pubDateLogical: "2026-07-15"
tags: ["AI", "Coding Agents", "Tokens", "Productivity"]
---

If you use coding agents like Claude Code, OpenCode, Codex or GitHub Copilot on a daily basis, you have probably lived through this scene: it is Tuesday, you are in the middle of a refactor, and the tool greets you with a _"you have reached your usage limit"_. Or worse: the end-of-month API bill arrives and it has more digits than you expected.

Coding agents are gluttons. Every question you ask, every file they open, every command they run gets converted into **tokens**, and tokens are exactly what you pay for. The good news: a lot of that consumption is pure waste, and there are increasingly good tools to trim it.

I have spent a while researching the token-saving tool ecosystem and I have found that almost everything fits into **three strategies**, sorted from cheapest to most expensive to adopt. But before looking at them, we need to understand where the money actually goes.

## Anatomy of the bill: input vs output

Every message exchanged with an LLM has two sides:

- **Input tokens:** everything the model _reads_. The system prompt, the tool definitions, your instructions, the files it opens, the output of the commands it runs... and, crucially, **the entire conversation replayed on every turn**, because the model has no memory between calls.
- **Output tokens:** everything the model _writes_. Its explanations, the code, the tool calls.

![Where the tokens go in a coding-agent session](/images/blog/token-saving-where-tokens-go.svg)

The asymmetry is double. In **volume**, input wins by a landslide: in a typical agent session it can easily be ~95% of all tokens, because the history gets re-sent over and over. In **unit price**, output wins: providers typically charge around **5 times more** per output token than per input token.

And there is a perverse detail: every token the model writes becomes input on the next turn. Verbose output charges you twice.

This gives us two very different attack surfaces: shrink the flood of input, or tame the (expensive) output. The three strategies below play on that board.

![Three strategies, three levels of commitment](/images/blog/token-saving-three-strategies.svg)

## Strategy 1: output-control skills

**Effort: minutes. Cost: zero.**

Output is the hardest part to control: you cannot compress what the model writes with a script _after_ it has written it — by then you have already paid. The only lever available is **prompting**: instructing the model to write less. That is exactly what this family of "skills" (instruction files the agent loads) does.

[**caveman**](https://github.com/juliusbrussee/caveman) is the most literal take on the idea: it makes the agent talk like a caveman. No filler phrases, no "Great question!", no three-paragraph explanations for a one-line change. Fragments and telegraphic style, while keeping code, commands and error messages intact. Its benchmark reports an average **65% reduction in output tokens** across its test prompts: an explanation of a React bug went from 1,180 tokens to 159. Two honest details worth appreciating: the authors admit that the skill itself adds 1–1.5k input tokens per turn, so the whole-session savings are smaller than the headline number; and it includes `/caveman-stats` so you can measure what you save, instead of taking their word for it.

[**ponytail**](https://github.com/DietrichGebert/ponytail) attacks the same problem from a more interesting angle: instead of compressing the _prose_, it compresses the _code_. Its motto is to make the agent "think like the laziest senior dev in the room". Before writing anything, the agent must climb a decision ladder: does this need to exist? does it already exist in the codebase? is it in the standard library? can it be one line? Only after all that may it write minimal code. Its tests report **54% less generated code and 22% fewer total tokens**, with no security cuts. The subtle part: less generated code also means less code the agent will have to _re-read_ in future sessions. It saves on output today and on input forever.

Why start here? Because it is free, installs in one command, and hits the most expensive tokens on the price sheet. If it annoys you (caveman style is not for everyone), you uninstall it and nothing happened.

## Strategy 2: compressing the input

**Effort: low. Cost: zero. Fine print: measure first.**

The second family puts itself in the middle of the pipeline: between your environment and the model, compressing what the agent reads before it reaches the context.

[**RTK**](https://github.com/rtk-ai/rtk) (Rust Token Killer) is a single Rust binary that intercepts shell commands and rewrites them into compressed versions: `git status` silently becomes `rtk git status`, which filters noise, groups similar lines and deduplicates repetitions before the output reaches the model. It claims reductions of 70–90% on things like test-runner output or `git diff`.

And here comes the most valuable lesson in this post, courtesy of my own tests: **RTK delivers on its promise, and yet it saved me almost nothing**. The compression is real — 60–70% on shell output. The problem is that in my development pipeline, shell command output is not even **1% of total input**. The bulk is file reads, conversation history, the system prompt. So the actual saving was 60% of 1%.

![A 70% compressor applied to 1% of your tokens](/images/blog/token-saving-sixty-of-one.svg)

It is the same logic as Amdahl's law in systems optimization: it does not matter how much you optimize a part; the total gain is capped by the weight of that part in the whole. A spectacular percentage applied to a tiny slice is a tiny saving. **Before installing any compressor, measure how big the slice it compresses is in _your_ usage.** If your agent lives inside enormous build logs and test suites, RTK can be a great deal. If not, it is a rounding error.

[**headroom**](https://github.com/headroomlabs-ai/headroom) is the more ambitious version of the idea: not a shell-command compressor but a **full proxy** between your agent and the API (`headroom wrap claude` and you are done). It routes each content type to a specialized compressor: JSON gets structural crushing (60–95% reduction), code gets AST-based analysis, prose goes through a small trained model. Compression is reversible: it stores the originals locally and gives the model a retrieval tool in case it needs the lost detail. For coding agents specifically it claims a more modest and credible **15–20%** — a figure that, notice, is consistent with my "60% of 1%" experience: whole-pipeline numbers are always far smaller than per-component headlines.

## Strategy 3: a knowledge graph of your codebase

**Effort: real setup and upkeep. Payoff: only if you amortize it.**

The third strategy attacks the biggest and least visible expense of all: **exploration**. When you ask an agent to fix a bug, it does not know where anything is. So it greps, opens files, reads them whole, discards them, opens others... tens of thousands of tokens just to _situate itself_. And the cruel part: on the next task it has forgotten everything and pays the whole bill again.

The idea here is to build, once, a **map of your repository** — which functions exist, who calls whom, what imports what — so the agent can ask precise questions instead of rummaging blindly.

![Exploring a codebase: grep loop vs knowledge graph](/images/blog/token-saving-graph-vs-grep.svg)

[**graphify**](https://github.com/Graphify-Labs/graphify) turns any code folder into a queryable knowledge graph. The base extraction uses tree-sitter to parse the AST of 36+ languages and pull out relationships (imports, calls, inheritance) **locally, deterministically and without a single LLM call** — building the code graph is free. It produces an interactive HTML graph, a report of key concepts, and a JSON the agent can query with commands like `graphify query` or `graphify explain` instead of grepping. Optionally, it can enrich the graph with docs, PDFs or images using an LLM, but that part does cost money.

[**codegraph**](https://github.com/colbymchenry/codegraph) is the same philosophy with a more "invisible infrastructure" finish: everything lives in a local SQLite database with full-text search, and a file watcher updates the graph automatically as you edit. You run `codegraph init` in each project, wire up your agents with `codegraph install` (Claude Code, Cursor, Codex...) and forget about it. Its benchmarks across 7 real codebases report a median **58% fewer tool calls** and up to **64% fewer tokens** on repos as large as VS Code. And again, praiseworthy honesty in the fine print: the savings are _scale-dependent_ — modest on a 500-file project, material on monorepos with heavy usage.

That is exactly the frame for deciding: this strategy has an entry cost (setup, learning, keeping the index alive) that only makes sense **if you are going to amortize it**. Big repo, many sessions per week, a whole team pointing agents at the same codebase? The math works out. A personal project with 40 files? The agent explores it whole for less than the index costs you.

## Cheat sheet

| Strategy                 | Examples            | Attacks...                | Effort         | Get it if...                                    |
| ------------------------ | ------------------- | ------------------------- | -------------- | ----------------------------------------------- |
| Output-control skills    | caveman, ponytail   | Output (the 5× tokens)    | Minutes        | Always — it is free to try                      |
| Input compression        | RTK, headroom       | Input (the 95% in volume) | Low            | You measured, and the compressible slice is fat |
| Codebase knowledge graph | graphify, codegraph | Exploration (repeated)    | Setup + upkeep | Big repo, heavy use, you can amortize the index |

## Closing thoughts

If I had to distill this post into three sentences: **start with a skill** because it is free and hits the expensive tokens; **measure before installing compressors**, because a spectacular percentage of a tiny slice is a tiny saving; and **invest in a knowledge graph only when the numbers say you will amortize it**.

And one final reminder that no tool replaces: the biggest token savings are still in the boring habits — well-scoped tasks, a good `CLAUDE.md`/`AGENTS.md` so the agent does not have to rediscover your conventions, and starting fresh sessions instead of dragging along kilometers of history. Tools compress tokens; habits avoid them.

## Further reading

- [caveman](https://github.com/juliusbrussee/caveman) — output compression via caveman-speak, with measurable stats.
- [ponytail](https://github.com/DietrichGebert/ponytail) — minimal code generation, YAGNI as a system prompt.
- [RTK](https://github.com/rtk-ai/rtk) — shell-output compressor in a single Rust binary.
- [headroom](https://github.com/headroomlabs-ai/headroom) — content-aware compression proxy with reversible compression.
- [graphify](https://github.com/Graphify-Labs/graphify) — code (and docs) to queryable knowledge graph, tree-sitter based.
- [codegraph](https://github.com/colbymchenry/codegraph) — local SQLite code graph with auto-sync, built for agents.
