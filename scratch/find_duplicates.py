import glob
import re

route_component_map = {}
for filepath in sorted(glob.glob('client/src/routes/**/*.tsx', recursive=True)):
    content = open(filepath, 'r', encoding='utf-8', errors='ignore').read()
    route_match = re.search(r"createFileRoute\(['\"](.*?)['\"]", content)
    if not route_match:
        continue
    rname = route_match.group(1)
    comp_match = re.search(r"component:\s*([A-Za-z0-9_]+)", content)
    func_match = re.search(r"function\s+([A-Za-z0-9_]+)", content)
    cname = comp_match.group(1) if comp_match else (func_match.group(1) if func_match else 'UNKNOWN')
    route_component_map[rname] = cname

comp_to_routes = {}
for rname, cname in route_component_map.items():
    comp_to_routes.setdefault(cname, []).append(rname)

print("=== DUPLICATE ROUTE COMPONENT MAPPINGS ===")
for cname, rlist in sorted(comp_to_routes.items()):
    if len(rlist) > 1 and cname not in ['Outlet', 'DashboardLayout', 'HODRouteLayout']:
        print(f"Component '{cname}' is mapped by {len(rlist)} routes:")
        for r in rlist:
            print(f"   - {r}")
