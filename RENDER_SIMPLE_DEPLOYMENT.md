# 🚀 Simple Render.com Deployment Guide

## Deploy Backend and Frontend Separately

Since we're having issues with the monorepo blueprint, let's deploy each service individually.

---

## 🐍 **Step 1: Deploy Backend First**

### **1.1 Create Backend Service**
1. Go to [render.com](https://render.com) dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `MukundC25/lrs`

### **1.2 Configure Backend Service**
```
Service Name: lrs-backend
Environment: Python
Region: Oregon (or closest to you)
Branch: main
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn app:app --host 0.0.0.0 --port $PORT
```

### **1.3 Environment Variables**
Add these in Render dashboard:
```
PYTHON_VERSION=3.9.16
PORT=10000
```

### **1.4 Deploy Backend**
- Click **"Create Web Service"**
- Wait for deployment (~5-10 minutes)
- Note the backend URL: `https://lrs-backend-XXXX.onrender.com`

---

## 🌐 **Step 2: Deploy Frontend (Static Site)**

### **2.1 Use Working Standalone Frontend**
We'll deploy the working standalone frontend from `/lrs-frontend-deploy`

### **2.2 Create Frontend Service**
1. In Render dashboard, click **"New +"** → **"Static Site"**
2. Connect the same GitHub repository OR create a new repo with just the frontend

### **2.3 Configure Frontend Service**
```
Service Name: lrs-frontend
Branch: main
Root Directory: (leave empty if using standalone repo)
Build Command: npm install && npm run build
Publish Directory: .next
```

### **2.4 Environment Variables**
```
NODE_VERSION=18.17.0
NEXT_PUBLIC_API_URL=https://lrs-backend-XXXX.onrender.com
NEXT_PUBLIC_APP_ENV=production
```
*(Replace XXXX with your actual backend URL)*

---

## 🎯 **Alternative: Deploy Standalone Frontend**

If the monorepo frontend still has issues, use the working standalone version:

### **Option A: Create New Repository**
1. Create new GitHub repo: `lrs-frontend-standalone`
2. Push the contents of `/lrs-frontend-deploy` to it
3. Deploy this new repo as a static site on Render

### **Option B: Use Netlify for Frontend**
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `.next` folder from `/lrs-frontend-deploy`
3. Set environment variable: `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`

---

## 🔧 **Backend Fixes Applied**

✅ **Added `pydantic-settings>=2.0.0`** to requirements.txt
✅ **Updated CORS** to allow Render domains
✅ **PORT environment variable** support
✅ **Simplified Dockerfile** for Render compatibility

---

## 📊 **Expected Results**

### **Backend Service:**
- **URL**: `https://lrs-backend-XXXX.onrender.com`
- **Health Check**: `/api/health`
- **API Docs**: `/docs`
- **ML Recommendations**: Working with sample data

### **Frontend Service:**
- **URL**: `https://lrs-frontend-XXXX.onrender.com`
- **Features**: Full UI with API integration
- **Performance**: Fast static site delivery

---

## 🎉 **Deployment Steps Summary**

1. **Deploy Backend** → Get backend URL
2. **Update frontend environment** → Set API URL
3. **Deploy Frontend** → Connect to backend
4. **Test Integration** → Verify full-stack works

This approach eliminates the monorepo complexity and should work reliably! 🚀
