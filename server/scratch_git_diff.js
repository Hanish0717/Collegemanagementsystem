import { execSync } from 'child_process';
import fs from 'fs';

try {
  let out = "=== GIT DIFF ===\n";
  try { out += execSync("git diff", { cwd: "d:\\ALL FILES\\MINI PROJECT\\INTESHIP\\Collegemanagementsystem" }).toString(); } catch(e) { out += e.message + "\n"; }

  fs.writeFileSync("d:\\ALL FILES\\MINI PROJECT\\INTESHIP\\Collegemanagementsystem\\server\\git_diff.txt", out);
  console.log("Git diff written to git_diff.txt");
} catch(err) {
  console.error(err.message);
}
