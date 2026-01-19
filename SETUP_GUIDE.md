# SugarShield - Complete Setup Guide for Mac

## Prerequisites
- macOS (any recent version)
- Node.js 18+ ([Download](https://nodejs.org/))
- Terminal app
- (Optional) OpenAI API Key for image upload feature

## Step-by-Step Setup

### 1. Extract the Project
```bash
# Navigate to Downloads folder
cd ~/Downloads

# Extract the archive
tar -xzf sugarshield.tar.gz

# Navigate into project
cd sugarshield
```

### 2. Install Dependencies
```bash
# Install all npm packages (this may take 2-3 minutes)
npm install
```

### 3. (Optional) Configure OpenAI API Key
```bash
# Copy the example env file
cp .env.local.example .env.local

# Edit .env.local with your favorite editor
nano .env.local
# or
open -e .env.local

# Add your OpenAI API key:
# OPENAI_API_KEY=sk-your-key-here

# Save and close
```

**Note:** The app works WITHOUT an API key! Barcode scanning and link extraction will still function.

### 4. Run Development Server
```bash
# Start the dev server
npm run dev

# You should see:
# ▲ Next.js 14.0.4
# - Local:        http://localhost:3000
```

### 5. Open in Browser
- Open Safari or Chrome
- Go to `http://localhost:3000`
- You should see the Sugar Shield interface!

## Testing the App

### Test Barcode Scan (Camera Required)
1. Click "Scan" tab
2. Click "Start Camera"
3. Allow camera access
4. Point at any product barcode
5. See results!

### Test Image Upload
1. Click "Upload" tab
2. Take a photo of a nutrition label
3. Upload it
4. See AI analysis!

### Test Link Paste
1. Click "Paste Link" tab
2. Paste any product URL
3. See extracted data!

### View Evaluation
- Go to http://localhost:3000/eval
- See 15 test cases and accuracy metrics

### View Analytics
- Go to http://localhost:3000/metrics
- See usage statistics

## Deploy to Vercel

### Method 1: Vercel CLI (Recommended)
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy from project directory
cd ~/Downloads/sugarshield
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (your account)
# - Link to existing project? No
# - Project name? sugarshield
# - Directory? ./
# - Override settings? No

# Your app will be live at: https://sugarshield-xxx.vercel.app
```

### Method 2: GitHub + Vercel Dashboard
```bash
# 1. Create GitHub repository
# Go to github.com and create new repo called "sugarshield"

# 2. Push code to GitHub
cd ~/Downloads/sugarshield
git init
git add .
git commit -m "Initial commit - SugarShield MVP"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sugarshield.git
git push -u origin main

# 3. Deploy on Vercel
# - Go to vercel.com/new
# - Click "Import Git Repository"
# - Select your sugarshield repo
# - Click "Deploy"

# 4. (Optional) Add environment variable
# - Go to Project Settings > Environment Variables
# - Add: OPENAI_API_KEY = sk-...
# - Redeploy
```

## Troubleshooting

### "npm: command not found"
- Install Node.js from https://nodejs.org/

### "Port 3000 is already in use"
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill

# Or use a different port
npm run dev -- -p 3001
```

### Camera not working
- Ensure you're using HTTPS or localhost
- Check browser permissions (Safari > Settings > Websites > Camera)
- Try a different browser (Chrome usually works better)

### "OPENAI_API_KEY not set" error
- This only affects image upload
- Barcode scan and link paste still work
- Add API key to .env.local if you want image upload

### Build errors
```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
npm run dev
```

## Project Structure
```
sugarshield/
├── app/              # Next.js pages
├── components/       # React components
├── lib/              # Core logic
├── public/           # Static assets
└── package.json      # Dependencies
```

## Features Implemented
✅ Barcode scanning with camera
✅ Image upload with AI analysis
✅ URL extraction and parsing
✅ Explainable classification engine
✅ Built-in evaluation framework (15 test cases)
✅ Privacy-friendly analytics
✅ Mobile-responsive premium UI
✅ Framer Motion animations

## Next Steps
1. Test all three input modes
2. Visit /eval to see how the classifier works
3. Deploy to Vercel to get a public URL
4. Share your portfolio piece!

## Support
If you encounter issues:
1. Check Node.js version: `node --version` (should be 18+)
2. Check npm version: `npm --version`
3. Clear and reinstall: `rm -rf node_modules && npm install`
4. Check the browser console for errors (F12)

---

**Built as an AI Product Management portfolio piece**
Demonstrates: Trust & Transparency, Uncertainty Handling, Evaluation Framework, System Design, Production Quality
