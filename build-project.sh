#!/bin/bash

echo "Building SugarShield project files..."

# Create README
cat > README.md << 'READMEEOF'
# SugarShield

**Explainable AI system for verifying sugar-free products**

## Quick Start on Mac

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Add OpenAI API key for image upload feature
cp .env.local.example .env.local
# Edit .env.local and add: OPENAI_API_KEY=sk-...

# 3. Run development server
npm run dev

# 4. Open http://localhost:3000
```

## Deploy to Vercel

```bash
# Method 1: Vercel CLI
npm install -g vercel
vercel

# Method 2: GitHub + Vercel Dashboard
# 1. Push to GitHub
# 2. Go to vercel.com/new
# 3. Import repository
# 4. Add OPENAI_API_KEY environment variable
# 5. Deploy
```

## Features

- 📷 **Barcode Scanning**: Scan product barcodes with camera
- 📤 **Image Upload**: Upload photos of nutrition labels  
- 🔗 **Link Paste**: Analyze products from URLs
- ✅ **Explainable AI**: Clear reasons for every verdict
- 📊 **Evaluation Mode**: Built-in test suite with 15 cases
- 📈 **Analytics**: Privacy-friendly usage metrics

## Tech Stack

- Next.js 14 + TypeScript
- Tailwind CSS + Framer Motion
- OpenAI Vision API
- Open Food Facts API

**Disclaimer:** For informational purposes only. Consult healthcare providers for medical advice.
READMEEOF

echo "✓ README.md created"

# Done
echo ""
echo "========================================="
echo "✅ SugarShield project structure complete!"
echo "========================================="

