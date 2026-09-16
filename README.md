# City-Wide AI Traffic Intelligence Engine
### Multi-Camera ANPR & Vehicle Analytics Platform — SIH26127 (BEL)

[![GitHub Repo](https://img.shields.io/badge/GitHub-Punithn9036%2Ftraffic--surveillance-blue?logo=github)](https://github.com/Punithn9036/traffic-surveillance)

## 📌 Project Overview
An AI-powered video analytics platform that ingests live CCTV / device camera streams, performs vehicle detection and classification, reads Indian license plates using ANPR OCR, tracks vehicles across non-overlapping camera feeds with cross-camera Re-ID, and surfaces real-time traffic intelligence & blacklist alerts on a web control dashboard.

---

## 🏗️ Architecture & Features

- **Vehicle Detection & Tracking**: Powered by YOLOv8 and Euclidean Multi-Object Centroid Tracking.
- **ANPR (Automatic Number Plate Recognition)**: Plate detection + OCR optimized for Indian license plate formats (`[A-Z]{2}[0-9]{1,2}[A-Z]{1,3}[0-9]{4}`).
- **Cross-Camera Re-Identification**: Matches vehicles across different camera views (CAM_01 ➔ CAM_02) using plate text ground truth and appearance color/feature embeddings.
- **Real-Time Control Dashboard**: Built with FastAPI, WebSockets, and Tailwind CSS.
- **Device Camera Integration**: Stream directly from local USB / laptop webcams (`VideoCapture(0)`).

---

## 📁 Repository Structure

```
traffic-surveillance/
├── ml-service/
│   ├── detection.py        # YOLOv8 vehicle & license plate region detector
│   ├── ocr.py               # License plate OCR & Indian format validator
│   ├── tracker.py           # Multi-object vehicle tracker (persistent IDs)
│   ├── reid.py              # Cross-camera Re-ID engine
│   └── pipeline.py          # Unified frame-by-frame surveillance pipeline
├── backend/
│   └── main.py              # FastAPI server + WebSocket camera broadcaster + Web UI
├── data/
│   └── sample_videos/       # Storage for CCTV clips & test footage
├── requirements.txt         # Dependencies
├── run_demo.py              # One-command system runner
└── README.md
```

---

## 🚀 Quickstart (Running on Local Device)

### 1. Install Dependencies
```bash
pip install -r requirements.txt
```

### 2. Launch Surveillance Engine & Web Dashboard
```bash
python run_demo.py
```

Open your browser at:
👉 **[http://127.0.0.1:8000](http://127.0.0.1:8000)**

---

## 📤 Pushing Code to GitHub

To sync your local changes to your GitHub repository:
```bash
git add .
git commit -m "Feat: Complete SIH City-Wide Traffic Surveillance Engine & Dashboard"
git push origin main
```
