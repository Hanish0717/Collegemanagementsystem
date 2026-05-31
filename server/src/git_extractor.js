import { execSync } from 'child_process';
import fs from 'fs';

try {
  console.log("Running git log on server/.env...");
  const log = execSync("git log -p -n 10 server/.env").toString();
  console.log("Git Log Output Length:", log.length);
  fs.writeFileSync("git_log_env.txt", log);
  console.log("Successfully wrote git_log_env.txt");
} catch (err) {
  console.error("Exec Error:", err.message);
}
