import os
import glob
import re

def replace_in_files():
    base_dir = r"d:\project\Fleetease\fleetease-frontend\web\src"
    jsx_files = glob.glob(os.path.join(base_dir, "**", "*.jsx"), recursive=True)
    js_files = glob.glob(os.path.join(base_dir, "**", "*.js"), recursive=True)
    
    files = jsx_files + js_files
    
    for file in files:
        with open(file, 'r', encoding='utf-8') as f:
            content = f.read()
            
        original_content = content
        
        # Replace text-white with nothing unless it's with bg-primary, bg-success, etc.
        # It's safer to just replace specific known ones or just change text-white to text-dark if it's meant to be default text.
        # Actually let's just remove "text-white" and let it use default color, except when it's clearly on a dark background or primary background.
        # For simplicity, let's just change text-white to text-main or remove it where appropriate.
        # Wait, CSS doesn't have a Bootstrap text-main. Let's replace 'text-white' with '' in headers:
        content = re.sub(r'text-white', 'text-dark', content)
        content = re.sub(r'text-light', 'text-muted', content)
        content = re.sub(r'bg-dark', 'bg-light', content)
        
        # Fix the ones that should stay white
        content = re.sub(r'bg-primary text-dark', 'bg-primary text-white', content)
        content = re.sub(r'bg-success text-dark', 'bg-success text-white', content)
        content = re.sub(r'bg-danger text-dark', 'bg-danger text-white', content)
        content = re.sub(r'bg-info text-dark', 'bg-info text-dark', content)
        
        # specific fixes
        content = content.replace("alert alert-info bg-primary bg-opacity-25 border-0 text-white", "alert alert-info bg-primary bg-opacity-10 border-0 text-primary")
        content = content.replace("bg-light bg-opacity-25", "bg-light border")
        
        if content != original_content:
            with open(file, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"Updated {file}")

if __name__ == '__main__':
    replace_in_files()
