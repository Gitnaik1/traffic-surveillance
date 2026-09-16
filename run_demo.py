import os
import sys
import subprocess
import time
import webbrowser

def main():
    print("=" * 70)
    print("  CITY-WIDE AI TRAFFIC INTELLIGENCE ENGINE (BEL SIH26127)")
    print("  Multi-Camera ANPR & Vehicle Analytics Platform")
    print("=" * 70)

    print("\n[1/3] Checking Python dependencies...")
    try:
        import cv2
        import numpy
        import fastapi
        import uvicorn
        print(" -> All required core vision & backend libraries verified.")
    except ImportError as e:
        print(f" -> Missing library: {e}")
        print(" -> Installing dependencies from requirements.txt...")
        subprocess.run([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])

    print("\n[2/3] Starting FastAPI Server & Multi-Camera Surveillance Service...")
    print(" -> Server URL: http://127.0.0.1:8000")
    print(" -> Interactive API Docs: http://127.0.0.1:8000/docs")

    # Serve index HTML landing page with live camera grid frontend
    import uvicorn
    uvicorn.run("backend.main:app", host="127.0.0.1", port=8000, reload=False)

if __name__ == "__main__":
    main()
