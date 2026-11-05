import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
// Proyectos independientes: no necesitan enlaces simbólicos ni permisos de administrador.
for (const directory of ["backend", "mobile"]) {
  const result = spawnSync(
    process.execPath,
    [process.env.npm_execpath, "ci", "--no-audit", "--no-fund"],
    {
      cwd: fileURLToPath(new URL(`../${directory}/`, import.meta.url)),
      stdio: "inherit",
    },
  );
  if (result.status !== 0) process.exit(result.status || 1);
}
