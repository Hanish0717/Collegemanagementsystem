import { execSync } from 'child_process';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cwd = path.resolve(__dirname, '..');

function runGit(command) {
  try {
    console.log(`\n> ${command}`);
    const output = execSync(command, { cwd }).toString();
    console.log(output);
    return true;
  } catch (error) {
    console.error(`Error during "${command}":`);
    if (error.stdout) console.log(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
    return false;
  }
}

console.log("=== AUTOMATIC FORCE-RESOLVE & PUSH ===");

// 1. Abort any stuck rebases or merges
console.log("\nAborting any stuck rebase operations...");
runGit("git rebase --abort");
runGit("git merge --abort");

// 2. Stage current work
console.log("\nStaging current local files...");
runGit("git add .");

// 3. Commit locally to keep changes safe
console.log("\nCommitting changes locally...");
runGit('git commit -m "Dashboard: updated student modules and auto-check features"');

// 4. Pull remote changes with automated conflict resolution favoring LOCAL work
console.log("\nPulling remote updates and auto-resolving conflicts in favor of your local changes...");
if (runGit("git pull origin main --no-rebase -X ours")) {
  // 5. Push successfully integrated updates to GitHub
  console.log("\nPushing everything up to GitHub...");
  if (runGit("git push origin main")) {
    console.log("\n=== SUCCESS: All your changes have been successfully merged and pushed to GitHub! ===");
  } else {
    console.error("\n=== PUSH FAILED: Please check your network or repository access. ===");
  }
} else {
  console.error("\n=== AUTO-RESOLVE PULL FAILED ===");
}
