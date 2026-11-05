import { spawn, spawnSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { parseEnv } from "node:util";
import { fileURLToPath } from "node:url";
import { ensureMysql } from "./ensure-mysql.mjs";

const root = new URL("../", import.meta.url);
const local = (path) => fileURLToPath(new URL(path, root));
const children = [];
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  for (const child of children) {
    if (child.exitCode !== null) continue;
    if (process.platform === "win32" && child.pid) {
      spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
        windowsHide: true,
        stdio: "ignore",
      });
    } else child.kill("SIGTERM");
  }
  process.exitCode = code;
}
function launch(args, directory, env = process.env) {
  const child = spawn(process.execPath, args, {
    cwd: local(directory),
    stdio: "inherit",
    env,
  });
  children.push(child);
  child.on("error", (error) => {
    console.error(error.message);
    stop(1);
  });
  child.on("exit", (code) => {
    if (!stopping) stop(code || 0);
  });
  return child;
}
process.on("SIGINT", () => stop());
process.on("SIGTERM", () => stop());
try {
  if (!existsSync(local("backend/.env")))
    throw new Error(
      "Falta backend/.env. Copia backend/.env.example y configura MySQL.",
    );
  if (!existsSync(local("mobile/node_modules/expo/bin/cli")))
    throw new Error("Faltan dependencias. Ejecuta npm ci desde la raíz.");
  const env = {
    ...parseEnv(readFileSync(local("backend/.env"), "utf8")),
    ...process.env,
  };
  await ensureMysql(env);
  const port = Number(env.PORT || 3000);
  // No reutilizar una instancia de otra carpeta ni arrancar dos APIs en el mismo puerto.
  let occupied = false;
  try {
    const response = await fetch(`http://127.0.0.1:${port}/health`, {
      signal: AbortSignal.timeout(1000),
    });
    occupied = response.status > 0;
  } catch {}
  if (occupied)
    throw new Error(
      `El puerto ${port} está ocupado. Cierra la instancia anterior de la API antes de iniciar cineapp.`,
    );
  const api = launch(["src/server.js"], "backend/", env);
  let ready = false;
  for (let attempt = 0; attempt < 40 && !stopping; attempt++) {
    try {
      const response = await fetch(`http://127.0.0.1:${port}/health`, {
        signal: AbortSignal.timeout(500),
      });
      if (response.ok) {
        ready = true;
        break;
      }
    } catch {}
    if (api.exitCode !== null) break;
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (!ready)
    throw new Error("La API no pudo iniciar. Revisa MySQL y backend/.env.");
  const tunnel = process.argv.includes("--tunnel");
  console.log(
    tunnel
      ? "Iniciando Expo Go por túnel para el celular…"
      : "Iniciando Expo local. Presiona w para abrir el navegador.",
  );
  launch(
    [
      local("mobile/node_modules/expo/bin/cli"),
      "start",
      "--go",
      ...(tunnel ? ["--tunnel", "ngrok", "--port", "8082"] : []),
    ],
    "mobile/",
  );
} catch (error) {
  console.error(`No se pudo iniciar cineapp: ${error.message}`);
  stop(1);
}
