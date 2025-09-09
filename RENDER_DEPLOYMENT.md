# 🚀 Render.com Deployment Guide

## Complete Step-by-Step Deployment to Render.com

### Prerequisites
- GitHub account with your repository
- Render.com account (free tier available)
- Repository pushed to GitHub

---

## 🎯 **Step 1: Prepare Your Repository**

✅ **Already Done:**
- `render.yaml` - Render configuration file
- `build.sh` - Build script for both services
- Updated backend config for PORT environment variable
- Updated frontend environment variables
- CORS settings for Render domains

---

## 🌐 **Step 2: Deploy to Render**

### **2.1 Create Render Account**
1. Go to [render.com](https://render.com)
2. Sign up with your GitHub account
3. Authorize Render to access your repositories

### **2.2 Connect Repository**
1. Click **"New +"** in Render dashboard
2. Select **"Blueprint"**
3. Connect your GitHub repository: `MukundC25/lrs`
4. Render will automatically detect the `render.yaml` file

### **2.3 Configure Services**
Render will create two services automatically:

#### **Backend Service (lrs-backend)**
- **Type**: Web Service
- **Environment**: Python
- **Build Command**: `cd backend && pip install -r requirements.txt`
- **Start Command**: `cd backend && uvicorn app:app --host 0.0.0.0 --port $PORT`
- **Plan**: Free
- **Auto-Deploy**: Yes

#### **Frontend Service (lrs-frontend)**
- **Type**: Web Service  
- **Environment**: Node.js
- **Build Command**: `cd frontend && npm install && npm run build`
- **Start Command**: `cd frontend && npm start`
- **Plan**: Free
- **Auto-Deploy**: Yes

---

## ⚙️ **Step 3: Environment Variables**

### **Backend Environment Variables:**
```
PYTHON_VERSION=3.9.16
PORT=10000
```

### **Frontend Environment Variables:**
```
NODE_VERSION=18.17.0
NEXT_PUBLIC_API_URL=https://lrs-backend.onrender.com
NEXT_PUBLIC_APP_ENV=production
```

---

## 🔗 **Step 4: Service URLs**

After deployment, your services will be available at:
- **Backend API**: `https://lrs-backend.onrender.com`
- **Frontend App**: `https://lrs-frontend.onrender.com`

---

## 🧪 **Step 5: Test Deployment**

### **Test Backend:**
```bash
curl https://lrs-backend.onrender.com/api/health
```

### **Test Frontend:**
Visit `https://lrs-frontend.onrender.com` in your browser

---

## 📊 **What Gets Deployed**

### **Backend Features:**
✅ FastAPI application with ML recommendations
✅ Content-based filtering with TF-IDF
✅ Health check endpoints
✅ CORS configured for frontend
✅ Sample data included

### **Frontend Features:**
✅ Next.js application with SSR
✅ Beautiful dark mode UI
✅ Mood-based recommendations
✅ Interactive components
✅ API integration with backend

---

## 🔧 **Troubleshooting**

### **Common Issues:**

1. **Build Fails:**
   - Check build logs in Render dashboard
   - Verify Node.js/Python versions
   - Check dependency installation

2. **Services Don't Connect:**
   - Verify environment variables
   - Check CORS settings
   - Ensure backend URL is correct

3. **Slow Cold Starts:**
   - Free tier has cold starts (~30s)
   - First request may be slow
   - Subsequent requests are fast

---

## 💰 **Render Free Tier Limits**

- **750 hours/month** per service
- **Cold starts** after 15 minutes of inactivity
- **512MB RAM** per service
- **Automatic SSL** certificates
- **Custom domains** supported

---

## 🎉 **Deployment Benefits**

✅ **Full-Stack Deployment** - Both frontend and backend
✅ **Automatic HTTPS** - SSL certificates included
✅ **Git Integration** - Auto-deploy on push
✅ **Environment Management** - Easy config updates
✅ **Monitoring** - Built-in logs and metrics
✅ **Zero Configuration** - Works with render.yaml

---

**Ready to deploy!** 🚀
