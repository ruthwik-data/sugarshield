# SugarShield - Simple food logging for sugar awareness

**Live**: https://sugarshield.vercel.app/

## 1. Problem & user
- Managing sugar intake is often hindered by complex nutrition apps that require manual entry of every ingredient.
- SugarShield is built for health-conscious users who want a frictionless way to log food and get an immediate sense of "sugar-heaviness" without the overhead of a traditional diet tracker.

## 2. What the product does
- **Fast Logging with Barcode Scanning**: Leverages `@zxing/browser` for quick item identification.
- **AI-Driven Health Analysis**: Uses OpenAI (GPT-4o/GPT-3.5-turbo) to classify foods and provide health context based on sugar content.
- **Daily Awareness Overview**: Simple visual representations of sugar intake to encourage better habits.
- **Automated Evaluations**: Includes a dedicated evaluation suite to benchmark the accuracy of the AI classifier.

## 3. How it works (system)
- **Frontend**: Next.js 14, React 18, Tailwind CSS, and Framer Motion for smooth interactions.
- **AI Core**: OpenAI API integration for intelligent product classification and nutritional analysis.
- **Data Model**: Uses local state combined with a curated `evalSet.json` for performance monitoring.
- **Flow**: User → log food (manual or barcode) → AI analysis & classification → app aggregates entries → user sees simple sugar picture.

## 4. Evals & limitations
### Evals
- **Systematic AI Benchmarking**: Features an `app/eval` suite that tests the AI classifier against a ground-truth `data/evalSet.json`.
- **Confidence Metrics**: Measures classification confidence to ensure reliable user feedback.

### Known limitations
- **No medical advice**: Intended for awareness only, not as a clinical tool.
- **Database Dependency**: Does not yet integrate with a large external nutrition database (e.g. nutritionix); relies on AI inference and local curated sets.
- **Analytics Depth**: Currently provides daily overviews; longitudinal trends are in the roadmap.

## 5. Run it locally
1. `git clone https://github.com/Ruthwik-Data/sugarshield.git`
2. `cd sugarshield`
3. `npm install`
4. Create a `.env.local` file with your `OPENAI_API_KEY`.
5. `npm run dev`
6. Open [http://localhost:3000](http://localhost:3000)

## 6. Status / roadmap
- [x] Initial MVP with AI classification
- [x] Automated evaluation suite implemented
- [ ] Add support for multi-day historical trends
- [ ] Implement browser-based nutritional scanning for online grocery shopping
- [ ] Refine AI prompts to handle complex composite meals
