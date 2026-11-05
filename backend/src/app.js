import express from "express";
import cors from "cors";
export function createApp(repository, { source = "demo" } = {}) {
  const app = express();
  app.disable("x-powered-by");
  app.use(
    cors({
      origin:
        process.env.CORS_ORIGIN === "*" || !process.env.CORS_ORIGIN
          ? "*"
          : process.env.CORS_ORIGIN.split(","),
    }),
  );
  app.use((_req, res, next) => {
    res.set("X-Content-Type-Options", "nosniff");
    next();
  });
  const positive = (value) =>
    typeof value === "string" &&
    /^[1-9]\d*$/.test(value) &&
    Number.isSafeInteger(Number(value));
  app.get("/health", async (_req, res) => {
    try {
      await repository.ping();
      res.json({ status: "ok", source });
    } catch {
      res.status(503).json({ error: "Base de datos no disponible" });
    }
  });
  app.get("/peliculas", async (req, res) => {
    const { q = "", categoriaId } = req.query;
    if (
      Object.keys(req.query).some(
        (key) => !["q", "categoriaId"].includes(key),
      ) ||
      typeof q !== "string" ||
      q.length > 100 ||
      (categoriaId !== undefined && !positive(categoriaId))
    )
      return res.status(400).json({ error: "Consulta inválida" });
    res.json({
      data: await repository.list({
        q,
        categoriaId: categoriaId ? Number(categoriaId) : undefined,
      }),
    });
  });
  app.get("/peliculas/:id", async (req, res) => {
    if (!positive(req.params.id))
      return res.status(400).json({ error: "Identificador inválido" });
    const movie = await repository.detail(Number(req.params.id));
    if (!movie)
      return res.status(404).json({ error: "Película no encontrada" });
    res.json({ data: movie });
  });
  app.get("/categorias", async (_req, res) =>
    res.json({ data: await repository.categories() }),
  );
  app.get("/directores", async (_req, res) =>
    res.json({ data: await repository.directors() }),
  );
  app.use((_req, res) => res.status(404).json({ error: "Ruta no encontrada" }));
  app.use((err, _req, res, _next) => {
    console.error("API error:", err.code || err.name);
    res
      .status(500)
      .json({
        error: "No fue posible consultar el catálogo. Inténtalo de nuevo.",
      });
  });
  return app;
}
