import os
import re

directory = r"c:\Users\Deepan\Downloads\project-assistance-main (2)\project-assistance-main\project-assistance-main\frontend\src"

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            path = os.path.join(root, file)
            with open(path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = content.replace(':5001', ':5000')
            
            if new_content != content:
                with open(path, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Updated: {path}")

print("Done.")
