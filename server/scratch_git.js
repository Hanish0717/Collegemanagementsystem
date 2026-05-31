import { execSync } from 'child_process';
import fs from 'fs';

try {
  let out = "=== GIT STATUS ===\n";
  try { out += execSync("git status", { cwd: "d:\\ALL FILES\\MINI PROJECT\\INTESHIP\\Collegemanagementsystem" }).toString(); } catch(e) { out += e.message + "\n"; }

  out += "\n=== GIT RECENT COMMITS ===\n";
  try { out += execSync("git log -n 5 --oneline", { cwd: "d:\\ALL FILES\\MINI PROJECT\\INTESHIP\\Collegemanagementsystem" }).toString(); } catch(e) { out += e.message + "\n"; }

  fs.writeFileSync("d:\\ALL FILES\\MINI PROJECT\\INTESHIP\\Collegemanagementsystem\\server\\git_status.txt", out);
  console.log("Git diagnostics written to git_status.txt");
} catch(err) {
  console.error(err.message);
}
