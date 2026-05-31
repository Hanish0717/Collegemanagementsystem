import { execSync } from 'child_process';

const cwd = "d:\\ALL FILES\\MINI PROJECT\\INTESHIP\\Collegemanagementsystem";

function runGit(command) {
  try {
    console.log(`Executing: ${command}`);
    const output = execSync(command, { cwd }).toString();
    console.log(output);
    return true;
  } catch (error) {
    console.error(`Error executing "${command}":`);
    if (error.stdout) console.log(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
    return false;
  }
}

console.log("=== STARTING AUTOMATED GIT SYNC & PUSH ===");

// 1. Pull latest remote changes to integrate them safely
console.log("\nPulling latest remote changes to integrate with your work...");
if (runGit("git pull --rebase origin main")) {
  // 2. Push local commits to remote
  console.log("\nPushing your changes to remote repository...");
  if (runGit("git push origin main")) {
    console.log("\n=== SUCCESS: All updates are pulled, integrated, and pushed to your friends and team! ===");
  } else {
    console.error("\n=== PUSH FAILED: Please check your remote repository permissions or internet connection. ===");
  }
} else {
  console.error("\n=== PULL/INTEGRATION FAILED: There might be direct file conflicts with remote changes. ===");
}
