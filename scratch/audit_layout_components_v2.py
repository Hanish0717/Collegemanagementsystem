import glob
import re
import os

print("=== AUDITING ALL ROUTE LAYOUTS AND INDEX ROUTES ===")

files = sorted(glob.glob('client/src/routes/**/*.tsx', recursive=True))

for filepath in files:
    content = open(filepath, 'r', encoding='utf-8', errors='ignore').read()
    route_match = re.search(r"createFileRoute\(['\"](.*?)['\"]", content)
    route_name = route_match.group(1) if route_match else filepath
    
    # Check if component is exported / returned
    has_outlet = ('<Outlet' in content) or ('component: Outlet' in content)
    has_component = ('component:' in content) or ('function Component' in content) or ('Route.lazy' in content)
    
    dir_of_file = filepath[:-4]
    is_layout = os.path.exists(dir_of_file) and os.path.isdir(dir_of_file)
    
    if is_layout:
        status = "OK (renders Outlet)" if has_outlet else "CRITICAL ERROR: LAYOUT MISSING OUTLET!"
        print(f"LAYOUT {route_name} ({filepath}) -> {status}")
        if not has_outlet:
            print(f"   Content snippet:\n{content[:300]}\n---")

