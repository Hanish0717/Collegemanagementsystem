import { execSync } from 'child_process';

const cwd = "d:\\ALL FILES\\MINI PROJECT\\INTESHIP\\Collegemanagementsystem";

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

console.log("=== AUTOMATIC GIT SYNC & PUSH ===");

// 1. Stage all changes
console.log("Staging changes...");
runGit("git add .");

// 2. Commit changes
console.log("Committing changes...");
runGit('git commit -m "Dashboard: removed CGPA, added roll number auto-check and autofill"');

// 3. Pull latest remote changes
console.log("Pulling latest changes from remote...");
if (runGit("git pull origin main --rebase")) {
  // 4. Push updates to remote
  console.log("Pushing updates to GitHub...");
  if (runGit("git push origin main")) {
    console.log("\n=== SUCCESS: All changes successfully pushed to Git! ===");
  } else {
    console.error("\n=== PUSH FAILED: Please check your network or repository access. ===");
  }
} else {
  console.error("\n=== PULL FAILED: Please resolve conflicts or check branch status. ===");
}
