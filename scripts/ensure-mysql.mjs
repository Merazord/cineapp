import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { spawn } from "node:child_process";
import mysql from "../backend/node_modules/mysql2/promise.js";

export async function ensureMysql(env) {
  if (env.DATA_SOURCE === "demo") return;
  const options = {
    host: env.DB_HOST || "127.0.0.1",
    port: Number(env.DB_PORT || 3306),
    user: env.DB_USER || "cineapp",
    password: env.DB_PASSWORD,
    database: env.DB_NAME || "cineapp",
    connectTimeout: 3000,
  };
  async function check() {
    const connection = await mysql.createConnection(options);
    try {
      await connection.ping();
    } finally {
      await connection.end();
    }
  }
  try {
    await check();
    return;
  } catch (error) {
    if (error.code !== "ECONNREFUSED") throw error;
  }
  if (
    process.platform !== "win32" ||
    !["localhost", "127.0.0.1"].includes(options.host)
  ) {
    throw new Error("Inicia MySQL y revisa backend/.env.");
  }
  const registry = join(
    process.env.LOCALAPPDATA ||
      join(process.env.USERPROFILE, "AppData", "Local"),
    "com.tinyapp.DBngin",
    "Data",
    "DBEngines.json",
  );
  if (!existsSync(registry))
    throw new Error("Inicia MySQL en DBngin y vuelve a ejecutar npm start.");
  const parsed = JSON.parse(readFileSync(registry, "utf8"));
  const engines = Array.isArray(parsed) ? parsed : [parsed];
  const engine = engines.find(
    (item) => item.Type === "mysql" && Number(item.Port) === options.port,
  );
  if (!engine)
    throw new Error(
      "No se encontró una instancia MySQL de DBngin para este puerto.",
    );
  const executable = join(engine.BinPath, "bin", "mysqld.exe");
  const config = engine.ConfigPath || join(engine.DBPath, "mysql.cnf");
  if (!existsSync(executable) || !existsSync(config))
    throw new Error("Revisa la instalación de MySQL en DBngin.");
  console.log("Iniciando la instancia local de MySQL de DBngin…");
  const child = spawn(executable, [`--defaults-file=${config}`], {
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  let launchError;
  child.on("error", (error) => {
    launchError = error;
  });
  child.unref();
  for (let attempt = 0; attempt < 30; attempt++) {
    if (launchError) throw launchError;
    await new Promise((resolve) => setTimeout(resolve, 1000));
    try {
      await check();
      return;
    } catch (error) {
      if (error.code !== "ECONNREFUSED") throw error;
    }
  }
  throw new Error("MySQL no inició a tiempo. Abre DBngin y revisa su estado.");
}
