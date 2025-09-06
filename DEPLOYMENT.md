# Vercel Deployment Guide

## 🚀 Deploy Smart Lifestyle & Learning Recommender to Vercel

### Prerequisites
- GitHub account with your repository
- Vercel account (free tier available)
- Repository pushed to GitHub

### Step-by-Step Deployment

#### 1. **Connect to Vercel**
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with your GitHub account
3. Click "New Project"
4. Import your `lrs` repository

#### 2. **Configure Project Settings**
⚠️ **IMPORTANT**: Set these exact settings:
- **Framework Preset**: Next.js
- **Root Directory**: `frontend` (CRITICAL!)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Development Command**: `npm run dev`

#### 3. **Environment Variables**
Add these environment variables in Vercel dashboard:
```
NEXT_PUBLIC_API_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_APP_ENV=production
```

#### 4. **Deploy**
- Click "Deploy"
- Wait for build to complete (~2-3 minutes)
- Your app will be live at `https://your-app-name.vercel.app`

### 🔧 Configuration Files Added

- `vercel.json` - Main Vercel configuration
- `backend/vercel_app.py` - Serverless backend entry point
- `backend/requirements.txt` - Updated with Mangum for serverless
- `frontend/.env.production` - Production environment variables

### 📊 What Gets Deployed

**Frontend (Next.js)**:
- React application with SSR
- Static assets and images
- API client configuration

**Backend (FastAPI)**:
- Serverless Python functions
- ML recommendation engine
- RESTful API endpoints

### 🎯 Post-Deployment

1. **Update API URL**: Replace `your-app-name` with your actual Vercel URL
2. **Test Endpoints**: Verify `/api/health` and `/api/recommend` work
3. **Monitor Performance**: Check Vercel dashboard for metrics

### 🔍 Troubleshooting

**"Functions property cannot be used with builds" Error?**
- ✅ **FIXED**: Updated vercel.json to remove conflicting properties
- Pull latest changes from GitHub and redeploy

**Build Fails?**
- Check Node.js version (use 18.x)
- Verify all dependencies in package.json
- Ensure root directory is set to `frontend`

**API Not Working?**
- Check Python runtime (3.9)
- Verify requirements.txt includes all packages
- Test `/api/health` endpoint first

**CORS Issues?**
- Ensure API URL matches in environment variables
- Check CORS settings in FastAPI app

**Deployment Stuck?**
- Try refreshing the Vercel dashboard
- Check build logs for specific errors
- Ensure GitHub repository is up to date

### 📈 Performance Tips

- **Cold Starts**: First API call may be slow (~2-3s)
- **Caching**: Static assets cached automatically
- **Optimization**: Images optimized by Next.js

---
**Ready to deploy!** 🎉
