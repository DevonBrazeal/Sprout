import os

directory = '/Users/devon/.gemini/antigravity/scratch/Sprout/src'
for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(('.jsx', '.js', '.css', '.html')):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
            # Careful replacement to preserve cases
            new_content = content.replace('Ghost', 'Sprout').replace('ghost', 'sprout')
            if content != new_content:
                with open(path, 'w') as f:
                    f.write(new_content)

files_to_rename = [
    ('src/components/GhostCharacter.jsx', 'src/components/SproutCharacter.jsx'),
    ('src/components/GhostCharacter.css', 'src/components/SproutCharacter.css'),
    ('src/hooks/useGhostEngine.js', 'src/hooks/useSproutEngine.js')
]

for old, new in files_to_rename:
    old_path = os.path.join('/Users/devon/.gemini/antigravity/scratch/Sprout', old)
    new_path = os.path.join('/Users/devon/.gemini/antigravity/scratch/Sprout', new)
    if os.path.exists(old_path):
        os.rename(old_path, new_path)
        print(f"Renamed {old} to {new}")
