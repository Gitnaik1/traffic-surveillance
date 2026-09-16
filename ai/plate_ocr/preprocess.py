"""
Person 2 — plate image preprocessing.
Takes a raw cropped plate region and prepares it for OCR.
"""

import cv2
import numpy as np

MIN_TARGET_WIDTH = 200  # upscale small crops to roughly this width


def preprocess_plate(plate_img: np.ndarray) -> np.ndarray:
    """
    Input : raw BGR plate crop (small, possibly low quality)
    Output: BGR image, cleaned and upscaled, ready for OCR
    """
    if plate_img is None or plate_img.size == 0:
        return plate_img

    img = plate_img.copy()
    h, w = img.shape[:2]

    # 1. Upscale small crops — OCR engines struggle below ~150px wide
    if w < MIN_TARGET_WIDTH:
        scale = MIN_TARGET_WIDTH / float(w)
        img = cv2.resize(img, (int(w * scale), int(h * scale)),
                          interpolation=cv2.INTER_CUBIC)

    # 2. Grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # 3. CLAHE contrast enhancement — helps with glare/shadow on plates
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(gray)

    # 4. Light denoise
    denoised = cv2.bilateralFilter(enhanced, 5, 50, 50)

    # 5. Back to 3-channel BGR — PaddleOCR/EasyOCR expect color images
    result = cv2.cvtColor(denoised, cv2.COLOR_GRAY2BGR)
    return result
