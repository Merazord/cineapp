import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { mysqlRepository } from "../src/mysql.js";
import { demoRepository } from "../src/catalog.js";
test("MySQL real: relaciones, búsqueda y API", async (t) => {
  const repo = mysqlRepository();
  t.after(() => repo.close());
  await repo.ping();
  const reference = demoRepository();
  assert.deepEqual(await repo.list(), await reference.list());
  assert.deepEqual(await repo.detail(1), await reference.detail(1));
  assert.deepEqual(
    await repo.list({ q: "LLUVIA" }),
    await reference.list({ q: "LLUVIA" }),
  );
  assert.deepEqual(
    await repo.list({ categoriaId: 1 }),
    await reference.list({ categoriaId: 1 }),
  );
  assert.equal((await repo.list({ q: "' OR 1=1 --" })).length, 0);
  assert.equal((await repo.list({ q: "%" })).length, 0);
  assert.equal((await repo.list({ q: "_" })).length, 0);
  assert.equal(await repo.detail(999), null);
  const server = createApp(repo, { source: "mysql" }).listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;
  assert.deepEqual(await (await fetch(base + "/health")).json(), {
    status: "ok",
    source: "mysql",
  });
  assert.equal(
    (await (await fetch(base + "/peliculas")).json()).data.length,
    6,
  );
  assert.equal((await fetch(base + "/peliculas/999")).status, 404);
});
