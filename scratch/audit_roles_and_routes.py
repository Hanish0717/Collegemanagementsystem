import glob
import re

routes = set()
for f in glob.glob('client/src/routes/**/*.tsx', recursive=True):
    content = open(f, encoding='utf-8', errors='ignore').read()
    for m in re.findall(r"createFileRoute\(['\"](.*?)['\"]", content):
        routes.add(m)

roles_content = open('client/src/lib/roles.ts', encoding='utf-8', errors='ignore').read()
links = re.findall(r"to:\s*['\"]([^'\"]+)['\"]", roles_content)

print(f"=== TOTAL REGISTERED TANSTACK ROUTES: {len(routes)} ===")
print(f"=== TOTAL LINKS IN ROLES.TS: {len(links)} ===")

missing = []
for l in links:
    base_path = l.split('?')[0]
    # Check exact match, slash match, or index match
    matched = (base_path in routes) or (base_path + '/' in routes) or (base_path.rstrip('/') in routes)
    if not matched:
        missing.append((l, base_path))

print(f"\n=== UNMATCHED LINKS IN ROLES.TS ({len(missing)}) ===")
for orig, base in missing:
    print(f"  ❌ ROLES.TS LINK: {orig} -> base path '{base}' not registered in routes!")
