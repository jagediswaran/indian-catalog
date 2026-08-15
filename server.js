const express = require("express");
const { manifest } = require("./manifest");
const { getCatalog, getMeta } = require("./addon");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 7000;

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Content-Type", "application/json");
  next();
});

app.get("/", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(
    `<h1>${manifest.name}</h1>
     <p>${manifest.description}</p>
     <p>Manifest: <a href="/manifest.json">/manifest.json</a></p>`
  );
});

app.get("/manifest.json", (req, res) => {
  res.send(JSON.stringify(manifest));
});

app.get("/catalog/:type/:id/:extra?.json", async (req, res) => {
  const { type, id } = req.params;
  const cleanId = id.replace(/\.json$/, "");
  const extra = parseExtra(req.params.extra);
  const result = await getCatalog(type, cleanId, extra);
  res.send(JSON.stringify(result));
});

app.get("/catalog/:type/:id.json", async (req, res) => {
  const { type, id } = req.params;
  const result = await getCatalog(type, id, {});
  res.send(JSON.stringify(result));
});

app.get("/meta/:type/:id.json", async (req, res) => {
  const { type, id } = req.params;
  const result = await getMeta(type, decodeURIComponent(id));
  res.send(JSON.stringify(result));
});

function parseExtra(extra) {
  if (!extra) return {};
  const clean = extra.replace(/\.json$/, "");
  const out = {};
  clean.split("&").forEach((pair) => {
    const [k, v] = pair.split("=");
    if (k) out[k] = decodeURIComponent(v || "");
  });
  return out;
}

app.listen(PORT, () => {
  console.log(`Add-on running at http://127.0.0.1:${PORT}/manifest.json`);
});

module.exports = app;
