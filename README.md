# SugarShield

**Live:** [https://sugarshield.vercel.app/](https://sugarshield.vercel.app/) · **Eval Dashboard:** [https://sugarshield.vercel.app/eval](https://sugarshield.vercel.app/eval)

Food ingredient safety scanner with built-in evaluation infrastructure. The eval isn't an afterthought — it's a first-class feature of the product.

---

## Why I Built This

Food labels use dozens of names for sugar — maltodextrin, dextrose, cane juice, rice syrup, corn syrup solids. A keyword-only system would miss half of them. Most nutrition apps don't tell you *how confident* they are or *what kind of mistakes* they make.

The core PM question was: **what failure mode is worse — over-warning or missing hidden sugar?** For a safety-first product, a false negative (telling someone a product is safe when it isn't) is riskier than a false positive (prompting a double-check). That answer shaped every eval and product decision.

---

## Eval Infrastructure

**[Live Eval Dashboard →](https://sugarshield.vercel.app/eval)**

### The Product Decision
We intentionally over-warn rather than miss hidden sugar. Conservative bias is not a bug — it's an explicit product choice documented in the eval page.

### Eval Metrics (Strict Mode)
| Metric | Result | Why It Matters |
|--------|--------|----------------|
| False Negatives | **0** | Intentional. Missing hidden sugar is the riskiest failure mode |
| Trigger Match Rate | **87%** | How often the model identifies the correct sugar ingredient |
| Conservative Bias | **Intentional** | Warn more, miss less — safety over precision |

### Strict vs. Lenient Mode
The eval dashboard exposes two evaluation modes so users can see the tradeoff:
- **Strict Mode** — flags artificial sweeteners, borderline ingredients, naturally occurring sugars in context
- **Lenient Mode** — passes products where sugar is naturally occurring or debated nutritionally

This lets users understand *why* a product was flagged, not just *that* it was flagged.

### Known Limitation (Documented)
The system may over-flag some products. This is intentional — explicitly stated on the eval page as a product tradeoff, not hidden from users.

### PM Insight (From Eval Page)
> Several WARN results (e.g., Diet Soda, Coconut Water) are intentional. These products contain sweeteners or naturally occurring sugars that are debated in nutritional science. SugarShield defaults to caution rather than silent pass to preserve user trust.

---

## What This Demonstrates

- **Eval-first product design** — the `/eval` page is built into the product, not a separate doc
- **Conservative bias as a product decision** — not an accident, documented and explained to users
- **False negative optimization** — 0 missed detections by intentional design
- **Confidence transparency** — users see confidence level and which triggers fired
- **Failure mode honesty** — known limitations surface in the product UI, not hidden in a README

---

## How It Works

- **Frontend:** Next.js 14, React 18, Tailwind CSS
- **AI Core:** OpenAI GPT-4o/GPT-3.5-turbo for ingredient classification
- **Eval Data:** Ground-truth `evalSet.json` with 15 test cases across input types (scan, link, upload)
- **Flow:** User → scan/upload ingredient label → AI classifies sugar content → confidence score + trigger list → PASS / WARN / FAIL

---

## Run Locally

1. `git clone https://github.com/Ruthwik-Data/sugarshield.git`
2. `cd sugarshield && npm install`
3. Create `.env.local` with your `OPENAI_API_KEY`
4. `npm run dev` → [http://localhost:3000](http://localhost:3000)
5. Visit `/eval` to see the full evaluation dashboard

---

## Status

- ✅ MVP with AI classification shipped
- ✅ Eval dashboard with strict/lenient mode
- ✅ False negative tracking (0 missed detections)
- ✅ Conservative bias documented as product decision
- ⏳ Multi-day historical trends
- ⏳ Browser-based nutritional scanning for online grocery shopping
