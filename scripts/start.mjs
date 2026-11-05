import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
const npm = process.env.npm_execpath;
const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) child.kill();
  process.exitCode = code;
}
for (const [directory, args] of [
  ["backend", ["start"]],
  ["mobile", ["start"]],
]) {
  const child = spawn(process.execPath, [npm, ...args], {
    cwd: fileURLToPath(new URL(`../${directory}/`, import.meta.url)),
    stdio: "inherit",
    env: process.env,
  });
  children.push(child);
  child.on("error", (error) => {
    console.error(error.message);
    stop(1);
  });
  child.on("exit", (code) => stop(code || 0));
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
