import { execSync } from 'child_process';

const cwd = "d:\\ALL FILES\\MINI PROJECT\\INTESHIP\\Collegemanagementsystem";

try {
  console.log("=== CHECKING GITHUB SYNC STATUS ===\n");
  
  // Fetch latest status from GitHub
  try {
    execSync("git fetch origin", { cwd });
  } catch(e) {
    console.warn("Could not fetch from remote. Checking local branch status instead...");
  }

  const status = execSync("git status", { cwd }).toString();
  console.log(status);

  // Check if we are ahead or behind
  if (status.includes("Your branch is up to date with 'origin/main'") || status.includes("nothing to commit, working tree clean")) {
    const unpushed = execSync("git log origin/main..main --oneline", { cwd }).toString().trim();
    if (!unpushed) {
      console.log("\n✅ Perfect! All your changes and modules have been SUCCESSFULY PUSHED to GitHub and are fully accessible by your team!");
    } else {
      console.log("\n⚠️ You still have some local commits that are not pushed yet. Please run: node git_auto_resolve.js");
    }
  } else if (status.includes("Your branch is ahead of 'origin/main'")) {
    console.log("\n⚠️ You have local changes that are NOT pushed yet. Please run: node git_auto_resolve.js");
  } else {
    console.log("\nℹ️ Branch is not fully synchronized. Please run: node git_auto_resolve.js to sync and push!");
  }
} catch(err) {
  console.error("Error checking sync status:", err.message);
}
