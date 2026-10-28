---
idx: 7
title: "Debt, Power and People: The Three Bottlenecks of the AI Boom"
author: "Guillermo Segovia"
pubDate: "November 4th, 2026"
pubDateLogical: "2026-11-04"
tags: ["AI", "Economy", "Infrastructure", "Jobs"]
---

In August 2026, Amazon expected to receive roughly $5 billion worth of Nvidia GB300 server racks at its US data centers, followed by around $3 billion more every month _"for the foreseeable future"_. The catch: some of those sites had room for the racks but not enough electricity to turn them on. According to internal emails reviewed by Business Insider, part of that finished equipment ended up waiting in intermediary warehouses.

That same October, insuring CoreWeave's debt (CoreWeave being the largest of the so-called _neoclouds_) started to cost more than 11% a year, a level markets associate with companies in trouble. And on October 26, Microsoft offered voluntary buyouts to about 60,000 employees, roughly 27% of its workforce, while its revenue grows 18% a year.

These three headlines look like they belong in different sections of the newspaper (finance, energy and jobs), but in my view they tell the same story: **demand for artificial intelligence is real, but the boom is running into three limits that cannot be solved by buying more GPUs**. Money is getting more expensive, electricity is not arriving on time, and companies are paying part of the bill with their workforce.

In this post I look at each of these bottlenecks with data and, at the end, I lay out three scenarios for the next five years, with the probability I assign to each. If you are interested in the historical framework (why technology bubbles almost always end in the credit market), I covered it in the talk [Burbujas tecnológicas 101](/talks/burbujas-tecnologicas-101/) (slides in Spanish).

## What a neocloud is and why it runs on debt

A _neocloud_ is a cloud provider that specializes almost exclusively in renting out GPU compute to train and serve AI models. Unlike Amazon Web Services, Microsoft Azure or Google Cloud, which have huge, diversified businesses behind them, a neocloud essentially does one thing: it buys GPUs, installs them in data centers and rents them out. The best-known names are CoreWeave, Nebius, Lambda, Crusoe and IREN.

The model follows a simple but demanding logic:

1. **Sign a multi-year contract** with a large customer (Microsoft, OpenAI, Meta...).
2. **Borrow** against that contract and against the GPUs themselves, which serve as collateral.
3. **Buy and install** the GPUs, which also requires securing a data center and, above all, electrical power.
4. **Collect rent** for a few years and use it to pay interest and repay the loan before the GPUs become obsolete.

It works if steps 3 and 4 happen on time and if the money in step 2 is cheap. CoreWeave is the clearest example of the tension this creates. In the second quarter of 2026 its revenue grew 112% to $2.575 billion, and its backlog of signed contracts reached about $104 billion. Those are the numbers of a company with real demand. But in that same quarter:

- It paid **$640 million in interest**, up from $267 million a year earlier.
- Its adjusted operating income was **$128 million**: interest was five times larger.
- It posted a **net loss of $626 million**.
- It invested **$6.4 billion** in equipment and facilities (_capex_) and raised **$13.5 billion** in new debt.

Add concentration on top of that: according to its annual report, Microsoft accounted for about 67% of CoreWeave's revenue in 2025. Total debt sits somewhere between $35 billion and $52 billion depending on the source and on whether leases are included.

In the bubbles talk I used economist Hyman Minsky's classification of borrowers into three types: those who pay interest and principal out of their income (hedge), those who only cover interest and need to refinance the principal (speculative), and those who cannot even cover the interest (what Minsky called, as a technical term, _Ponzi_). With results like those of the second quarter, a leveraged neocloud depends on the debt market staying open. And that is precisely what has started to come into question.

## First bottleneck: credit

### What a CDS is and why it matters

A _credit default swap_ (CDS) works like insurance against a company defaulting. The buyer pays an annual premium and, if the company fails to repay its debt, receives compensation. The premium is quoted in basis points (bp): 100 bp means paying 1% a year on the insured amount.

It is a very useful thermometer for two reasons. First, it is set by professional investors with their own money on the line, not by analysts making forecasts. Second, it tends to move before the stock market: creditors have more to lose in a default and look at the balance sheet more closely than the average shareholder.

### CoreWeave's climb

CoreWeave's five-year CDS has gone from about 421 bp a year ago to 1,167 bp on October 22, 2026, its peak in twelve months of S&P Global Market Intelligence data. Above 1,000 bp, the market considers a company to be in _distress_.

![Animated bar chart: CoreWeave's five-year CDS rises from 421 basis points in October 2025 to a peak of 1,167 on October 22, 2026, above the 1,000-point threshold markets associate with financial distress](/images/blog/ai-bottlenecks-coreweave-cds.svg)

In practical terms, at 1,148 bp (the October 26 level) insuring one million dollars of CoreWeave debt costs about $114,800 a year. Under a standard 40% recovery assumption, that price implies a five-year default probability of around 62%. That number deserves careful reading: probabilities implied by a CDS include the premium investors demand for bearing the risk, so they tend to overstate the real probability. They do not say CoreWeave will go bankrupt; they say the market wants to be paid as if it were quite possible.

The bonds tell the same story. On October 15, CoreWeave bonds maturing in 2031 and 2032 traded between 78 and 80 cents on the dollar, yielding between 15.6% and 16.2%. Below 80 cents, a bond is usually considered _distressed_. S&P rates the company B+, in speculative-grade territory. That same day, Nvidia CEO Jensen Huang (Nvidia being CoreWeave's shareholder, supplier and customer at the same time) said in Stockholm that _"CoreWeave's strength is growing by the day"_ and that Nvidia does not believe it needs to act as a financial backstop.

### Contagion

The problem has not stayed with CoreWeave:

- **Oracle**, which has signed data center contracts worth hundreds of billions (OpenAI accounts for nearly half of its $638 billion in remaining performance obligations), saw its five-year CDS hit a record 288 bp on October 15, up from 144 bp at the start of the year. In July, S&P cut it to BBB−, the last notch before junk.
- **SoftBank**, one of OpenAI's largest backers, had its CDS at 424 bp the same day.
- In the stock market, during October, CoreWeave fell around 35%, Nebius nearly 29% and IREN almost 46%, even though the latter two do not carry CoreWeave's debt structure.

Some heavyweight warnings have piled on. On October 13, the International Monetary Fund listed a correction in AI-linked assets, in both equities and credit, among the three main risks in its financial stability report. On October 15, Gartner predicted that more than 80% of neoclouds will cease to operate independently by 2030 because of cost pressure and lack of differentiation. And on October 26, Elon Musk said more than 200 neoclouds face inevitable consolidation because debt markets have almost completely closed to anyone without revenue beyond data centers. Musk competes in this market through xAI, so his view is not neutral, but it matches what prices are saying.

### Why this matters beyond CoreWeave

The underlying reason is scale. Goldman Sachs estimates that more than $750 billion in AI-related debt will be issued in 2026. Morgan Stanley projects global data center investment of about $2.9 trillion between 2025 and 2028, and expects the large tech companies to cover only about half of it from their own cash. The rest, around $1.5 trillion, will have to come from debt: most of it, about $800 billion, from private credit, a market that is less transparent and less regulated than the stock market.

In other words, building AI infrastructure has shifted from being funded by profits to being funded by debt. And when funding depends on debt, the cost of that debt becomes as important a variable as model performance.

## Second bottleneck: electricity

### Dark GPUs

Business Insider uses the term _dark GPUs_ for the phenomenon this post opened with: chips and servers that have been bought and paid for but sit idle because the data center has no power available. Amazon has created a program, _Early Rack Receipt_, that lets it take ownership of racks before they reach the data center, whereas previously it did so on delivery. The logic is to lock in scarce supply ahead of competitors. According to one of the emails, at least one internal team did not have _"a clear forecasted path"_ for installing the incoming racks. Amazon says that staging hardware near data centers until capacity is ready is _"best business practice"_.

The cost of that wait shows up in the accounts. Amazon expects to invest about $220 billion in 2026, more than any other Big Tech company, and its free cash flow for the twelve months to June was −$7.6 billion, compared with +$18.2 billion a year earlier. According to an internal recording reported by the same outlet, AWS's finance chief joked with the head of infrastructure about having taken the whole company free cash flow negative, and the latter expects it to stay that way for a couple of years.

This needs context. Amazon is not a neocloud: AWS grew 37% in the second quarter, has a $496 billion backlog and enough cash to ride this out. But the mechanism is the same one choking the smaller players: **a GPU without electricity generates no revenue, but it does generate interest and depreciation**.

![Animated loop: debt is raised, GPUs are bought, GPUs wait without power and interest piles up, forcing more borrowing; only a grid connection breaks the loop and produces rental revenue](/images/blog/ai-bottlenecks-debt-loop.svg)

### The price paradox

One data point, to me, captures the situation well. Between 2023 and 2025, the price of renting an H100 GPU fell sharply, and many read that as a sign of oversupply. In 2026 the opposite has happened: according to price indices compiled by industry aggregators, the price of one-year H100 contracts rose 38% between October 2025 and March 2026, and Nebius raised its on-demand rate from $3.85 to $4.50 per hour on October 1.

So demand does not seem to be lacking. What is lacking is capacity that is switched on. The bottleneck has moved from the chip to the power grid, and the grid moves at a different speed: a power plant or a high-voltage line takes years to plan and build, while Nvidia ships a new chip generation every year. PJM, the operator of the largest power grid in the United States, has already announced that from June 2027 it may temporarily cut supply to data centers of 50 megawatts or more to prevent blackouts. Morgan Stanley has estimated a shortfall of about 32 gigawatts for US data centers through 2028, a figure I have found quoted in the press but not in its original source.

This is where, in my view, the geopolitical dimension of the problem comes in. For years the AI race has been measured in chips, and US export controls have focused on them. But if electricity is the limiting factor, the advantage shifts to whoever can build generation and grid capacity faster. That is a matter of industrial and energy policy, not just technology.

## Third bottleneck: people

### More revenue, fewer employees

The third limit is quieter. In its latest fiscal year, which ended on June 30, 2026, Microsoft brought in $331.8 billion, 18% more than the previous year and the largest annual increase in its history. Over the same period, its headcount fell from 228,000 to 223,000, the first decline since 2016, and R&D went from a peak of 81,000 employees in 2024 to 77,000.

![Microsoft's cumulative growth since fiscal 2007: revenue grows 549% while headcount grows 182% and has flattened since 2022](/images/blog/ai-bottlenecks-microsoft-revenue-headcount.svg)

Bloomberg recently published a chart that sums up the trend; the version above is built from Microsoft's annual reports. Since 2007, revenue has grown 6.5-fold and headcount 2.8-fold. Revenue per employee has gone from about $650,000 to nearly $1.5 million. Until 2022 both curves rose together, at different speeds; since then, headcount has stayed flat while revenue accelerates.

Recent moves are consistent with that chart:

- More than 15,000 layoffs in 2025.
- A first voluntary buyout program in spring 2026.
- About 4,800 layoffs in July 2026, concentrated in Xbox and sales.
- On October 26, a voluntary buyout offer to about 60,000 employees in the United States, the United Kingdom, Canada and India, who must decide in early December and would leave on December 31.

Meanwhile, Microsoft invested $41 billion in _capex_ in the April to June quarter alone.

### What can and cannot be claimed

Precision matters here. Microsoft maintains that the eliminated roles are not being replaced by AI, but that AI is changing how work gets done. I have no data to claim otherwise, and it would be a mistake to frame these cuts as "AI has replaced 60,000 people": this is a voluntary offer, and according to the company itself, similar programs at other tech firms have seen uptake of between 3% and 5%.

What can be claimed is subtler and, in my view, more relevant: **Big Tech is funding part of its infrastructure investment by holding down spending on people**. This is not unique to Microsoft; Amazon cut about 30,000 jobs between late 2025 and early 2026, and Google has also offered voluntary buyouts. When you have to justify tens of billions in data centers to the market every quarter, headcount is one of the few cost lines that can be adjusted quickly.

The social impact is twofold. In the short term, these are skilled jobs disappearing in the fastest-growing sector. In the medium term, if the model becomes entrenched, the wealth generated by technology shifts even further towards capital (whoever owns the data centers) and away from labor. It is a conversation that goes beyond any single company and that, I believe, we should have with data and without alarmism.

## Three futures through 2031

With these three bottlenecks on the table, what could happen? I propose three scenarios for the short term (2027) and the medium term (through 2031). The probabilities are **my own estimate**, not a quantitative model. I assigned them by weighing the signals above and the lessons of past technology investment cycles (railways, telecoms, dot-com), which usually end with the technology winning and part of its financiers losing.

![Three illustrative paths for AI infrastructure investment between 2026 and 2031: optimistic with a 20% probability, neutral with 50% and pessimistic with 30%](/images/blog/ai-bottlenecks-three-scenarios.svg)

### Optimistic: the grid catches up with demand (20%)

**Short term.** Results for the fourth quarter of 2026 and the first of 2027 show AI revenue growing at the promised pace: the large labs maintain their growth rates and providers' backlogs turn into billings. CoreWeave refinances its maturities, perhaps with the help of a strategic partner, and its spreads fall back below 600 bp. Dark GPUs come online as new substations and on-site generation (gas, batteries) enter service.

**Medium term.** Between 2028 and 2031, investment in the grid and in generation catches up with demand. The cost of serving a model falls, applications with a clear return appear and productivity starts to show up in the statistics. The surviving neoclouds become profitable specialized providers. Tech employment rebuilds around new profiles.

**Why only 20%.** It requires everything to go right at once: revenue, energy and credit. Historically, investment cycles of this size rarely end without an intermediate correction.

### Neutral: consolidation with damage (50%)

**Short term.** AI keeps growing, but not fast enough to sustain everyone. One or more neoclouds restructure their debt, get bought by a hyperscaler or a fund, or swap their bonds at a loss for creditors. Big Tech moderates capex growth in 2027 and 2028 without slamming on the brakes. Part of the older GPU fleet is written down earlier than planned, with visible accounting impairments. Headcount cuts continue gradually.

**Medium term.** The pattern resembles telecoms after 2001, but contained: the infrastructure stays (data centers, chips and power contracts change hands at lower prices) and the technology keeps advancing, just as the fiber laid back then later enabled YouTube and the cloud. By the end of the period, the market is dominated by the hyperscalers and two or three consolidated neoclouds, in line with Gartner's forecast. Electricity remains the limiting factor and the main driver of siting decisions.

**Why 50%.** It is the scenario most consistent with current signals: credit under strain but no major defaults yet, real demand, hyperscalers with the cash to absorb assets, and a consolidation the industry itself already expects.

### Pessimistic: the tap is turned off (30%)

**Short term.** Credit stress spreads. A major neocloud default causes losses at private credit funds, which gate redemptions and stop financing new projects. Oracle loses its investment-grade rating, forcing funds that cannot hold junk to sell its bonds. One of the large labs struggles to close its next funding round and renegotiates its compute commitments, leaving multi-billion-dollar contracts in limbo. Tech companies cut capex sharply and the stock market corrects broadly.

**Medium term.** Several years of tech recession, with widespread layoffs across the sector and a drop in investment that drags down the US economy, where AI investment has become one of the supports of growth. The technology does not disappear, but its rollout is delayed by several years, until the excess capacity is absorbed at fire-sale prices.

**Why 30%.** Credit signals are the worst since the start of the cycle, dependence on a few loss-making customers is high, and a growing share of the financing sits in opaque markets. I do not consider it the base case because the largest investors are still some of the most profitable companies in the world and, as of October 28, 2026, I have not found any significant defaults on AI-linked debt.

### What to watch to know which scenario we are in

| Indicator              | Today (October 2026)  | Optimistic          | Neutral                        | Pessimistic                |
| ---------------------- | --------------------- | ------------------- | ------------------------------ | -------------------------- |
| CoreWeave 5-year CDS   | ~1,150 bp             | < 600 bp            | 800–1,500 bp, restructuring    | Default or distressed swap |
| Oracle credit rating   | BBB− (S&P)            | Holds or improves   | BBB− with negative outlook     | Loses investment grade     |
| Hyperscaler capex      | Growing every quarter | Keeps growing       | Plateaus in 2027–28            | Double-digit cuts          |
| GPU rental price       | Rising in 2026        | Stable              | Falls as capacity comes online | Collapses on forced sales  |
| GPUs waiting for power | Racks in warehouses   | Switched on in 2027 | One- to two-year delays        | Projects cancelled         |
| Big Tech headcount     | Flat or declining     | Rebuilds            | Gradual cuts                   | Mass layoffs               |

## Conclusion

If I had to keep three ideas:

1. **Demand is not the problem; financing is.** CoreWeave is growing at 112% and the market still prices it like a company in trouble. In technology cycles, who survives is decided by the cost of money, not by the quality of the technology.
2. **The bottleneck has moved from the chip to the plug.** Paid-for GPUs waiting in warehouses and rising rental prices say the same thing: there is not enough capacity switched on, and the grid is not being built at Nvidia's pace.
3. **Workers are paying part of the bill.** Microsoft's revenue grows 18% while its headcount shrinks. It is not a direct replacement by AI, but it is a reallocation of resources from people to infrastructure.

My reading is that we are closest to the neutral scenario: consolidation with damage, in which some financiers lose money, infrastructure changes hands and the technology keeps advancing. That is what has happened almost every time. But the gap between the neutral and the pessimistic scenario is narrow, and what will decide it is something the general public rarely watches: the credit market. That is why, over the coming months, rather than headlines about new models, I would keep an eye on bond spreads, Oracle's ratings and how fast the GPUs now sitting in a warehouse get switched on.

## Further reading

- [Burbujas tecnológicas 101](/talks/burbujas-tecnologicas-101/) (slides in Spanish): the talk on the historical pattern of bubbles, from Minsky to railways and telecoms.
- [IMF · Global Financial Stability Report, October 2026](https://www.imf.org/en/Publications/GFSR): the analysis of the risk an AI correction poses to financial stability.
- [Goldman Sachs · How AI debt is reshaping credit markets](https://www.goldmansachs.com/insights/goldman-sachs-exchanges/how-ai-debt-is-reshaping-the-credit-market): a conversation on the role of debt in the current cycle.

## References

- [Business Insider · Amazon's Nvidia GPUs wait in warehouses as data centers face power shortages (Oct 20, 2026)](https://www.businessinsider.com/amazon-nvidia-ai-gpu-data-centers-power-shortages-2026-10)
- [Yahoo Finance · Amazon's Nvidia chips are sitting in warehouses without power, Business Insider reports](https://finance.yahoo.com/technology/ai/articles/amazons-nvidia-chips-sitting-warehouses-180630226.html)
- [CoreWeave · CoreWeave Reports Strong Second Quarter 2026 Results](https://investors.coreweave.com/news/news-details/2026/CoreWeave-Reports-Strong-Second-Quarter-2026-Results/default.aspx)
- [CNBC · CoreWeave credit default swaps hit distress levels as investors sour on AI debt (Oct 15, 2026)](https://www.cnbc.com/2026/10/15/coreweave-credit-default-swaps-hit-distress-levels-as-investors-sour-on-ai-debt.html)
- [Benzinga · CoreWeave debt fears hit a grim record (Oct 26, 2026)](https://www.benzinga.com/markets/bonds/26/10/62603452/coreweave-cds-record-lehman-default-risk)
- [BigGo Finance · CoreWeave's five-year default probability soars; Jensen Huang on financing costs](https://finance.biggo.com/news/7484e05c-561d-43d5-8c9e-95537e5b5688)
- [The Motley Fool · CoreWeave stock is getting crushed (Oct 21, 2026)](https://www.fool.com/investing/2026/10/21/coreweave-stock-is-getting-crushed-heres-what/)
- [Securitas Global · Oracle's CDS spread hits a record 288 basis points on AI debt](https://www.securitasglobal.com/risk-perspectives/oracle-cds-record-288-basis-points-ai-debt/)
- [24/7 Wall St. · AI cloud stocks sink as Gartner warns most neoclouds won't survive independently (Oct 15, 2026)](https://247wallst.com/investing/2026/10/15/ai-cloud-stocks-sink-as-gartner-warns-most-neoclouds-wont-survive-independently-iren-and-coreweave-fall-5-nebius-drops-4/)
- [CNBC · Elon Musk says more than 200 neoclouds face 'guppy-level death' (Oct 26, 2026)](https://www.cnbc.com/2026/10/26/neocloud-stocks-today-coreweave-nebius-iren-elon-musk.html)
- [Startup Fortune · AI neocloud stocks sink as CoreWeave debt fears spread to equities](https://startupfortune.com/ai-neocloud-stocks-sink-as-coreweave-debt-fears-spread-to-equities/)
- [BusinessDay / Reuters · IMF warns of risks from AI market correction and war (Oct 13, 2026)](https://www.businessday.co.za/world/americas/2026-10-13-imf-warns-of-risks-from-ai-market-correction-and-war/)
- [Goldman Sachs · How AI debt is reshaping credit markets](https://www.goldmansachs.com/insights/goldman-sachs-exchanges/how-ai-debt-is-reshaping-the-credit-market)
- [Forbes · The half-trillion-dollar silicon gamble: inside the AI debt boom (Oct 22, 2026)](https://www.forbes.com/sites/mayrarodriguezvalladares/2026/10/22/the-half-trillion-dollar-silicon-gamble-inside-the-ai-debt-boom/)
- [TechCrunch · Data centers may face temporary power cuts to prevent blackouts on largest US grid (Jul 28, 2026)](https://techcrunch.com/2026/07/28/data-centers-may-face-temporary-power-cuts-to-prevent-blackouts-on-largest-us-grid/)
- [IntuitionLabs · H100 rental prices compared across cloud providers (2026)](https://intuitionlabs.ai/articles/h100-rental-prices-cloud-comparison)
- [Microsoft · Form 10-K, fiscal year 2026 (SEC)](https://www.sec.gov/Archives/edgar/data/0000789019/000119312526323660/msft-20260630.htm)
- [Microsoft · Annual reports, fiscal years 2007–2025 (SEC EDGAR)](https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0000789019&type=10-K)
- [Fortune · Microsoft offers buyouts to nearly 30% of workforce in ongoing AI shift (Oct 26, 2026)](https://fortune.com/2026/10/26/microsoft-offers-buyouts-to-nearly-30-of-workforce-in-ongoing-ai-shift/)
- [CNBC · Microsoft offers voluntary buyouts to 60,000 employees (Oct 26, 2026)](https://www.cnbc.com/2026/10/26/microsoft-msft-voluntary-buyouts.html)
- [TechCrunch · Microsoft lays off nearly 5,000 employees across Xbox, commercial sales (Jul 6, 2026)](https://techcrunch.com/2026/07/06/microsoft-lays-off-nearly-5000-employees-across-xbox-commercial-sales/)
- Bloomberg · "Microsoft Headcount Flatlined as Revenue Exploded" (chart, October 2026)
- [Talk · Burbujas tecnológicas 101](/talks/burbujas-tecnologicas-101/) (slides in Spanish)
