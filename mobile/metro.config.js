const http = require("node:http");
const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);
const enhance = config.server.enhanceMiddleware;

// Proxy de desarrollo: permite compartir Expo y la API por el mismo túnel.
// El destino es fijo; no permite seleccionar otros servidores desde la URL.
config.server.enhanceMiddleware = (middleware, server) => {
  const downstream = enhance ? enhance(middleware, server) : middleware;
  return (req, res, next) => {
    if (!req.url?.startsWith("/cineapp-api/")) {
      return downstream(req, res, next);
    }
    if (req.method !== "GET" && req.method !== "OPTIONS") {
      res.writeHead(405, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({ error: "Método no permitido" }));
    }
    const upstream = http.request(
      {
        hostname: "127.0.0.1",
        port: 3000,
        method: req.method,
        path: req.url.slice("/cineapp-api".length),
        headers: { ...req.headers, host: "127.0.0.1:3000" },
      },
      (response) => {
        res.writeHead(response.statusCode || 502, response.headers);
        response.pipe(res);
      },
    );
    upstream.setTimeout(8000, () => upstream.destroy());
    upstream.on("error", () => {
      if (res.headersSent) return res.destroy();
      res.writeHead(502, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "La API local no está disponible" }));
    });
    req.on("aborted", () => upstream.destroy());
    req.pipe(upstream);
  };
};

module.exports = config;
