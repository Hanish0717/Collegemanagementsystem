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

console.log("=== STARTING AUTOMATED GIT PUSH ===");

// 1. Stage all changes
console.log("\nStaging all modified and new files...");
if (runGit("git add .")) {
  // 2. Commit changes
  console.log("\nCommitting changes with descriptive message...");
  const commitMsg = "Dashboard Refactor: Simplified layout modules, removed CGPA column, fixed role redirects/header navigation, conditionally hid + New button for non-operational roles, and added real-time database roll-number verification with automatic form autofill.";
  if (runGit(`git commit -m "${commitMsg}"`)) {
    // 3. Push to remote
    console.log("\nPushing commits to remote repository...");
    if (runGit("git push")) {
      console.log("\n=== SUCCESS: All updates are pushed to your friends and team! ===");
    } else {
      console.error("\n=== PUSH FAILED: Please check your internet connection or git remote permissions. ===");
    }
  } else {
    console.error("\n=== COMMIT FAILED: Nothing to commit or git user config is missing. ===");
  }
} else {
  console.error("\n=== STAGING FAILED ===");
}
