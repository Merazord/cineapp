import { test } from "node:test";
import assert from "node:assert/strict";
import { createApp } from "../src/app.js";
import { demoRepository } from "../src/catalog.js";
test("API: catálogo, detalle, filtros, validación y errores", async (t) => {
  const server = createApp(demoRepository()).listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  t.after(() => server.close());
  const get = (path) =>
    fetch(`http://127.0.0.1:${server.address().port}${path}`);
  assert.equal((await (await get("/peliculas")).json()).data.length, 6);
  const detail = (await (await get("/peliculas/1")).json()).data;
  assert.equal(detail.director, "Elena Vargas");
  assert.equal(detail.categoria, "Ciencia ficción");
  assert.equal(
    (await (await get("/peliculas?categoriaId=1")).json()).data.length,
    2,
  );
  assert.equal((await (await get("/peliculas?q=LLUVIA")).json()).data[0].id, 6);
  assert.equal(
    (await (await get("/peliculas?q=inexistente")).json()).data.length,
    0,
  );
  for (const path of [
    "/peliculas/-1",
    "/peliculas/abc",
    "/peliculas?categoriaId=0",
    "/peliculas?q[x]=1",
  ])
    assert.equal((await get(path)).status, 400);
  assert.equal((await get("/peliculas/999")).status, 404);
  assert.equal((await (await get("/categorias")).json()).data.length, 4);
  assert.equal((await (await get("/directores")).json()).data.length, 4);
  assert.equal((await (await get("/health")).json()).status, "ok");
});
test("fallo de base de datos devuelve un error seguro", async (t) => {
  const repo = {
    ...demoRepository(),
    list: async () => {
      throw Error("secret");
    },
    ping: async () => {
      throw Error("offline");
    },
  };
  const server = createApp(repo).listen(0, "127.0.0.1");
  await new Promise((r) => server.once("listening", r));
  t.after(() => server.close());
  const base = `http://127.0.0.1:${server.address().port}`;
  const response = await fetch(base + "/peliculas");
  assert.equal(response.status, 500);
  assert.equal(JSON.stringify(await response.json()).includes("secret"), false);
  assert.equal((await fetch(base + "/health")).status, 503);
});
