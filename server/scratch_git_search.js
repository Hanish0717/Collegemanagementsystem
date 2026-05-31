import { execSync } from 'child_process';

try {
  let out = "";
  
  // Find which commits touched transport files
  try {
    out += "=== GIT LOG TOUCHING src/controllers/transportController.js ===\n";
    out += execSync("git log --oneline --follow -- src/controllers/transportController.js", { maxBuffer: 10*1024*1024 }).toString();
  } catch (e) {
    out += "Error: " + e.message + "\n";
  }

  // Find commits matching "transport"
  try {
    out += "\n=== GIT LOG MATCHING 'transport' ===\n";
    out += execSync("git log --grep=\"transport\" --oneline", { maxBuffer: 10*1024*1024 }).toString();
  } catch (e) {
    out += "Error: " + e.message + "\n";
  }

  console.log(out);
} catch (err) {
  console.error(err);
}
