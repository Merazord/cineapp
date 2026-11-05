const { test } = require("node:test");
const assert = require("node:assert/strict");

test("API de desarrollo sigue el servidor Expo LAN o túnel", async () => {
  const { getApiUrl } = await import("../src/api-url.ts");
  assert.equal(
    getApiUrl(undefined, "192.168.1.10:8081", true),
    "http://192.168.1.10:8081/cineapp-api",
  );
  assert.equal(
    getApiUrl("", "demo-8082.exp.direct", true),
    "https://demo-8082.exp.direct/cineapp-api",
  );
  assert.equal(
    getApiUrl("", "demo-8082.exp.direct:80", true),
    "https://demo-8082.exp.direct/cineapp-api",
  );
  assert.equal(
    getApiUrl("https://api.example.com/", "demo.exp.direct", true),
    "https://api.example.com",
  );
  assert.equal(
    getApiUrl(undefined, "demo.exp.direct", false),
    "http://localhost:3000",
  );
});
