import glob
import re
import os

print("=== CHECKING ROUTE LAYOUT COMPONENTS FOR OUTLET RENDERING ===")

layout_files = []
for filepath in sorted(glob.glob('client/src/routes/**/*.tsx', recursive=True)):
    dir_of_file = filepath[:-4]
    is_layout = os.path.exists(dir_of_file) and os.path.isdir(dir_of_file)
    
    content = open(filepath, 'r', encoding='utf-8', errors='ignore').read()
    route_match = re.search(r"createFileRoute\(['\"](.*?)['\"]", content)
    route_name = route_match.group(1) if route_match else filepath
    
    has_outlet = '<Outlet' in content
    
    if is_layout:
        layout_files.append((route_name, filepath, has_outlet))
        if not has_outlet:
            print(f"[NO OUTLET] LAYOUT HAS SUB-ROUTES BUT MISSING <Outlet />: {route_name} -> {filepath}")
        else:
            print(f"[OK] LAYOUT HAS OUTLET: {route_name}")

print(f"\nTotal layout routes checked: {len(layout_files)}")
