import { execSync } from 'child_process';

try {
  let out = "";
  
  try {
    out += "=== DIFF FOR src/controllers/transportController.js between 710e928 and 5bfc44c ===\n";
    out += execSync("git diff 710e928 5bfc44c -- src/controllers/transportController.js", { maxBuffer: 10*1024*1024 }).toString();
  } catch (e) {
    out += "Error: " + e.message + "\n";
  }

  try {
    out += "\n=== FILE AT 710e928 ===\n";
    out += execSync("git show 710e928:server/src/controllers/transportController.js", { maxBuffer: 10*1024*1024 }).toString();
  } catch (e) {
    try {
      out += execSync("git show 710e928:src/controllers/transportController.js", { maxBuffer: 10*1024*1024 }).toString();
    } catch (e2) {
      out += "Error: " + e2.message + "\n";
    }
  }

  console.log(out);
} catch (err) {
  console.error(err);
}
