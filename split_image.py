from PIL import Image
import sys
import os

img_path = sys.argv[1]
try:
    img = Image.open(img_path)
    print(f"Size: {img.width}x{img.height}")
    
    out_dir = "/Users/devon/.gemini/antigravity/scratch/Sprout/src/assets"
    os.makedirs(out_dir, exist_ok=True)
    img.save(f"{out_dir}/prd_bg.jpg")
    
    # Crop the center
    cw, ch = img.width // 2, img.height // 2
    box_size = int(img.height * 0.4)
    box = (cw - box_size//2, ch - box_size//2, cw + box_size//2, ch + box_size//2)
    sprout = img.crop(box)
    sprout.save(f"{out_dir}/prd_sprout_crop.jpg")
    print(f"Cropped to {box}")
except Exception as e:
    print(f"Error: {e}")
