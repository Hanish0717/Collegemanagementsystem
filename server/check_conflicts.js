import { execSync } from 'child_process';
import fs from 'fs';

const cwd = "d:\\ALL FILES\\MINI PROJECT\\INTESHIP\\Collegemanagementsystem";

try {
  let out = "=== GIT STATUS ===\n";
  try { out += execSync("git status", { cwd }).toString(); } catch(e) { out += e.message + "\n"; }
  
  fs.writeFileSync("d:\\ALL FILES\\MINI PROJECT\\INTESHIP\\Collegemanagementsystem\\server\\git_conflict_status.txt", out);
  console.log("Written conflict status to git_conflict_status.txt");
} catch(err) {
  console.error("Error:", err.message);
}
