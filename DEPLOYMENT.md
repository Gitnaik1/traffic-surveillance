# UrbanTrax AI — Cloud Deployment & Hosting Guide

This guide explains how to push your ANPR & Traffic Intelligence project to the cloud so that it can run 24/7 and be accessed from any device (laptop, mobile, tablet, remote cameras).

---

## 1. Store Code & Model Weights in Git / GitHub

Since the trained ONNX model (`plate_detector.onnx` — 11.7 MB) is lightweight, it can be included directly in your GitHub repository!

### Steps to push to GitHub:
```bash
# 1. Initialize git repository if not already done
git init

# 2. Add all project files (including trained models)
git add .

# 3. Commit your changes
git commit -m "Deploy ANPR YOLOv8 model and FastAPI backend"

# 4. Link your remote GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/urbantrax-anpr.git
git branch -M main
git push -u origin main
```

---

## 2. Cloud Deployment Options

### Option A: Render.com / Railway.app (Easiest & Free/Cheap)
Render and Railway automatically build your project using the included `Dockerfile` directly from your GitHub repository.

1. **Sign up** at [render.com](https://render.com) or [railway.app](https://railway.app).
2. **Create New Web Service** → Connect your GitHub repository `urbantrax-anpr`.
3. **Environment**: Choose **Docker**.
4. **Port**: Set to `8000`.
5. Click **Deploy**. Your service will be accessible live at `https://urbantrax-anpr.onrender.com`.

---

### Option B: Hugging Face Spaces (Free AI Hosting)
Hugging Face offers free CPU/GPU spaces for hosting PyTorch / ONNX / FastAPI apps.

1. Go to [huggingface.co/spaces](https://huggingface.co/spaces).
2. Click **Create new Space** → Select **Docker** or **Gradio/FastAPI**.
3. Push your repository to your Hugging Face Space remote git URL.
4. Your API and dashboard will be live automatically.

---

### Option C: AWS / DigitalOcean / Linode (Production Linux VPS)
For dedicated performance, deploy on an Ubuntu Linux virtual private server (VPS).

1. SSH into your VPS:
   ```bash
   ssh root@YOUR_SERVER_IP
   ```
2. Clone your repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/urbantrax-anpr.git
   cd urbantrax-anpr
   ```
3. Build and launch with Docker:
   ```bash
   docker build -t urbantrax-ai .
   docker run -d -p 8000:8000 --name urbantrax-service --restart always urbantrax-ai
   ```

---

## 3. Connecting Devices to Your Cloud API

Once deployed to the cloud, any device can interact with your ANPR system:

* **REST API Endpoint**: `https://YOUR_CLOUD_URL/api/anpr/process_frame`
* **Real-time Video WebSocket**: `wss://YOUR_CLOUD_URL/ws/camera/{camera_id}`
* **Interactive API Docs (Swagger UI)**: `https://YOUR_CLOUD_URL/docs`
