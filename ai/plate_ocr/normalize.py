import re

def normalize_plate(raw_text: str):
    """
    Normalizes the raw OCR text to extract a clean license plate string.
    Returns:
        (clean_text, norm_confident)
    """
    if not raw_text:
        return "", False
    
    # Remove all non-alphanumeric characters and convert to uppercase
    clean = re.sub(r'[^A-Za-z0-9]', '', raw_text).upper()
    
    # Indian license plates generally have 8 to 10 alphanumeric characters
    # e.g., MH12AB1234 (10 chars), DL7CCD9087 (10 chars)
    confident = 8 <= len(clean) <= 10
    
    return clean, confident
