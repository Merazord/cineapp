import { createApp } from "./app.js";
import { demoRepository } from "./catalog.js";
import { mysqlRepository } from "./mysql.js";
const source = process.env.DATA_SOURCE || "mysql";
if (!["mysql", "demo"].includes(source))
  throw new Error("DATA_SOURCE debe ser mysql o demo");
const repository = source === "mysql" ? mysqlRepository() : demoRepository();
await repository.ping();
const server = createApp(repository, { source }).listen(
  Number(process.env.PORT || 3000),
  "0.0.0.0",
  () =>
    console.log(
      `CineApp API en puerto ${process.env.PORT || 3000} (${source})`,
    ),
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () =>
    server.close(async () => {
      await repository.close?.();
      process.exit(0);
    }),
  );
