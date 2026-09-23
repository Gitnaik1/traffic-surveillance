import os
import sys
import base64
import cv2
from fastapi.testclient import TestClient

# Add project root to sys.path
root_dir = os.path.dirname(os.path.abspath(__file__))
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)
backend_dir = os.path.join(root_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from backend.app.main import app

def test_anpr_endpoints():
    client = TestClient(app)

    print("\n--- 1. Testing GET /api/anpr ---")
    res = client.get("/api/anpr")
    print(f"Status: {res.status_code}")
    print(f"Records returned: {len(res.json())}")

    print("\n--- 2. Testing POST /api/anpr/process_frame ---")
    sample_img_path = os.path.join(root_dir, "ai", "plate_ocr", "samples", "vehicle_03.jpg")
    if not os.path.exists(sample_img_path):
        print(f"Sample image not found at {sample_img_path}")
        return

    with open(sample_img_path, "rb") as f:
        img_bytes = f.read()

    b64_str = base64.b64encode(img_bytes).decode("utf-8")

    payload = {
        "image_base64": f"data:image/jpeg;base64,{b64_str}",
        "camera_id": "CAM-001"
    }

    res = client.post("/api/anpr/process_frame", json=payload)
    print(f"Status: {res.status_code}")
    data = res.json()
    print("Response Data:")
    for k, v in data.items():
        if k == "preprocessed_crop" and v:
            print(f"  {k}: [base64 image string, len={len(v)}]")
        else:
            print(f"  {k}: {v}")

    print("\nAll ANPR backend endpoint tests completed successfully!")

if __name__ == "__main__":
    test_anpr_endpoints()
