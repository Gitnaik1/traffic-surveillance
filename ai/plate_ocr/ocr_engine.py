"""
Person 2 — OCR engine wrapper.
Primary: PaddleOCR 3.x, using the .predict() API.
Fallback: EasyOCR, auto-triggered if Paddle errors or returns nothing.

Interface:
    engine = OCREngine()
    text, confidence, raw_text = engine.read(plate_img_bgr)
"""

import numpy as np
from config import OCR_BACKEND


class OCREngine:
    def __init__(self, backend: str = OCR_BACKEND):
        self.backend = backend
        self._paddle = None
        self._easyocr = None
        self._init_backend()

    def _init_backend(self):
        if self.backend == "paddleocr":
            try:
                from paddleocr import PaddleOCR
                self._paddle = PaddleOCR(use_textline_orientation=True, lang="en")
                print("[OCREngine] backend=paddleocr (3.x .predict API)")
            except Exception as e:
                print(f"[OCREngine] PaddleOCR init failed ({e}); switching to easyocr")
                self.backend = "easyocr"

        if self.backend == "easyocr":
            import easyocr
            self._easyocr = easyocr.Reader(["en"], gpu=False)
            print("[OCREngine] backend=easyocr")

    def read(self, plate_img: np.ndarray):
        """
        Returns: (best_text: str, confidence: float, raw_full_text: str)
        Returns ("", 0.0, "") if nothing was read.
        """
        if plate_img is None or plate_img.size == 0:
            return "", 0.0, ""

        if self.backend == "paddleocr":
            try:
                return self._read_paddle(plate_img)
            except Exception as e:
                print(f"[OCREngine] paddleocr read failed at runtime ({e}); "
                      f"falling back to easyocr for this image")
                if self._easyocr is None:
                    import easyocr
                    self._easyocr = easyocr.Reader(["en"], gpu=False)
                return self._read_easyocr(plate_img)

        return self._read_easyocr(plate_img)

    # ---------- PaddleOCR 3.x ----------
    def _read_paddle(self, plate_img):
        results = self._paddle.predict(plate_img)

        if not results:
            return "", 0.0, ""

        page = results[0]  # single image in, single OCRResult out

        # PaddleOCR 3.x OCRResult supports dict-style access
        texts = page.get("rec_texts", []) if hasattr(page, "get") else page["rec_texts"]
        scores = page.get("rec_scores", []) if hasattr(page, "get") else page["rec_scores"]

        if not texts:
            return "", 0.0, ""

        # Join all detected text fragments left-to-right (a plate may be
        # read as 1-2 fragments depending on spacing/state code separation)
        full_text = " ".join(t.strip() for t in texts if t.strip())
        avg_conf = float(sum(scores) / len(scores)) if scores else 0.0

        # "best single token" = longest fragment, usually the actual plate
        best_fragment = max(texts, key=len) if texts else ""

        return best_fragment.strip(), avg_conf, full_text

    # ---------- EasyOCR fallback ----------
    def _read_easyocr(self, plate_img):
        results = self._easyocr.readtext(plate_img)
        if not results:
            return "", 0.0, ""

        texts = [r[1] for r in results]
        confs = [r[2] for r in results]
        full_text = " ".join(t.strip() for t in texts if t.strip())
        avg_conf = float(sum(confs) / len(confs)) if confs else 0.0
        best_fragment = max(texts, key=len) if texts else ""

        return best_fragment.strip(), avg_conf, full_text
