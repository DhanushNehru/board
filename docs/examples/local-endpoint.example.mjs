// Example local adapter that speaks the Sketch Studio remote-endpoint
// contract and forwards to a free, self-hosted image model server.
//
// It expects an AUTOMATIC1111 Stable Diffusion WebUI running locally with
// the API enabled (`--api`), which is free and needs no account or key.
// Run the adapter with:  node docs/examples/local-endpoint.example.mjs
// Then set config.local.json to:
//   { "remoteEndpoint": { "url": "http://localhost:8787/generate", "token": "" } }
//
// This file is an example for contributors. It is not loaded by the app.

import { createServer } from "node:http";

const A1111_URL = process.env.A1111_URL || "http://127.0.0.1:7860";
const PORT = 8787;

async function handleGenerate(req, res) {
  const body = await readJson(req);
  // Contract in:  { image: "data:image/png;base64,...", prompt: "..." }
  const base64 = String(body.image || "").replace(/^data:image\/\w+;base64,/, "");
  if (!base64) return send(res, 400, { error: "image is required" });

  // Free local model call: img2img with the sketch as the init image.
  const r = await fetch(`${A1111_URL}/sdapi/v1/img2img`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      init_images: [base64],
      prompt: body.prompt || "a clean digital rendering of this sketch",
      denoising_strength: 0.6,
      steps: 20
    })
  });
  if (!r.ok) return send(res, 502, { error: `model server returned ${r.status}` });
  const out = await r.json();

  // Contract out:  { image: "<base64>" }  (or { text: "..." })
  send(res, 200, { image: out.images && out.images[0] });
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try { resolve(JSON.parse(data)); } catch (e) { reject(e); }
    });
  });
}

function send(res, status, obj) {
  res.writeHead(status, {
    "Content-Type": "application/json",
    // Allow the static board page to call this adapter from a browser.
    "Access-Control-Allow-Origin": "*"
  });
  res.end(JSON.stringify(obj));
}

createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Methods": "POST"
    });
    return res.end();
  }
  if (req.method === "POST" && req.url === "/generate") {
    handleGenerate(req, res).catch((e) => send(res, 500, { error: e.message }));
  } else {
    send(res, 404, { error: "not found" });
  }
}).listen(PORT, () => {
  console.log(`Example adapter on http://localhost:${PORT}/generate`);
  console.log(`Forwarding to ${A1111_URL}/sdapi/v1/img2img`);
});
