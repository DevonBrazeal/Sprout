import os

def remove_bg():
    try:
        import rembg
    except ImportError:
        print("Installing rembg...")
        os.system("pip install rembg[cli] --quiet")
    
    # Process
    in_path = "/Users/devon/.gemini/antigravity/scratch/Sprout/src/assets/prd_sprout_crop.jpg"
    out_path = "/Users/devon/.gemini/antigravity/scratch/Sprout/src/assets/sprout_transparent.png"
    
    print(f"Removing background from {in_path}...")
    cmd = f"python3 -m rembg i {in_path} {out_path}"
    os.system(cmd)
    
    if os.path.exists(out_path):
        print(f"Successfully created {out_path}")
    else:
        print("Failed to create transparent image.")

if __name__ == "__main__":
    remove_bg()
