#!/bin/bash

echo "================================================"
echo "  MISE - Deploy OpenAI Migration to Vercel"
echo "================================================"
echo ""

cd /home/ubuntu/projects/mise

# Check if we're in a git repo
if [ ! -d .git ]; then
  echo "❌ Not a git repository. Run 'git init' first."
  exit 1
fi

# Show what's changed
echo "📋 Files changed:"
git status --short
echo ""

# Confirm deployment
read -p "Deploy these changes to Vercel? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo "❌ Deployment cancelled."
  exit 0
fi

echo ""
echo "📝 Committing changes..."
git add .
git commit -m "Migrate to OpenAI GPT-4o-mini + rate limiting + usage tracking

- Switch from Claude Sonnet 4 to GPT-4o-mini (96% cost reduction)
- Add per-IP rate limiting (100/hr, 500/day)
- Add usage tracking and logging
- Create stats dashboard script
- Tested and verified quality equivalent to Claude"

echo ""
echo "🚀 Pushing to GitHub..."
git push

echo ""
echo "✅ Pushed to GitHub! Vercel will auto-deploy."
echo ""
echo "⚠️  IMPORTANT: Add OpenAI API key to Vercel:"
echo "   1. Go to https://vercel.com/your-project/settings/environment-variables"
echo "   2. Add variable: OPENAI_API_KEY"
echo "   3. Value: <your-openai-api-key>"
echo "   4. Redeploy (or Vercel will auto-redeploy on next push)"
echo ""
echo "📊 Monitor usage with: bash ~/mise_usage_stats.sh"
echo ""
echo "================================================"
