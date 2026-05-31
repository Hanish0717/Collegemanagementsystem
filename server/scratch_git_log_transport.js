import { execSync } from 'child_process';
import fs from 'fs';

try {
  console.log("SHOWING FILE HISTORY...");
  let out = "";
  try {
    out += execSync("git log --oneline -- \"src/controllers/transportController.js\" \"controllers/transportController.js\"", { maxBuffer: 10*1024*1024 }).toString();
  } catch (e) {
    out += e.message + "\n";
  }
  fs.writeFileSync("d:\\ALL FILES\\MINI PROJECT\\INTESHIP\\Collegemanagementsystem\\server\\git_full_log.txt", out);
} catch (err) {
  console.error(err);
}
