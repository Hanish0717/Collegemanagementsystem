import glob
import re

print("=== AUDITING COMPONENT MAPPINGS ACROSS ALL ROUTE FILES ===")

route_component_map = {}

for filepath in sorted(glob.glob('client/src/routes/**/*.tsx', recursive=True)):
    content = open(filepath, 'r', encoding='utf-8', errors='ignore').read()
    
    route_match = re.search(r"createFileRoute\(['\"](.*?)['\"]", content)
    if not route_match:
        continue
    route_name = route_match.group(1)
    
    # Extract component rendered
    comp_match = re.search(r"component:\s*([A-Za-z0-9_]+)", content)
    func_match = re.search(r"function\s+([A-Za-z0-9_]+)", content)
    
    comp_name = comp_match.group(1) if comp_match else (func_match.group(1) if func_match else "UNKNOWN")
    
    route_component_map[route_name] = (comp_name, filepath)

# Group by component name to find duplicate mappings
comp_to_routes = {}
for rname, (cname, fpath) in route_component_map.items():
    comp_to_routes.setdefault(cname, []).append(rname)

print("\n--- DUPLICATE ROUTE COMPONENT MAPPINGS (Different routes mapping to same Component) ---")
for cname, rlist in sorted(comp_to_routes.items()):
    if len(rlist) > 1 and cname not in ['Outlet', 'DashboardLayout', 'HODRouteLayout']:
        print(f"Component '{cname}' is mapped by {len(rlist)} routes:")
        for r in rlist:
            print(f"   - {r}")

print("\n--- ALL ROUTE COMPONENT MAPPINGS ---")
for rname in sorted(route_component_map.keys()):
    cname, fpath = route_component_map[rname]
    print(f"  {rname:45} -> Component: {cname}")
