// Contract tests for the remote endpoint provider.
// These run the real provider file in Node with a mocked fetch and a stub
// registry. They verify the request/response contract only - they do NOT
// call a real model, and no live model generation is claimed by them.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

function loadProvider() {
  const registered = {};
  const sandbox = {
    window: {
      BOARD_STUDIO_CONFIG: {},
      SketchGenerator: {
        register: (p) => { registered[p.id] = p; }
      }
    },
    fetch: async () => { throw new Error("fetch not mocked"); },
    Promise,
    Error,
    JSON
  };
  vm.createContext(sandbox);
  const code = readFileSync(new URL("../js/generator/providers/remote-endpoint.js", import.meta.url), "utf8");
  vm.runInContext(code, sandbox);
  return { provider: registered["remote-endpoint"], sandbox };
}

const stubCanvas = { toDataURL: () => "data:image/png;base64,QUJD" };

test("is not ready without a configured endpoint URL", () => {
  const { provider } = loadProvider();
  assert.equal(provider.needsConfig, true);
  assert.equal(provider.isReady(), false);
});

test("is ready once a URL is configured", () => {
  const { provider, sandbox } = loadProvider();
  sandbox.window.BOARD_STUDIO_CONFIG = { remoteEndpoint: { url: "https://example.com/generate" } };
  assert.equal(provider.isReady(), true);
});

test("sends the documented request shape with auth only when a token is set", async () => {
  const { provider, sandbox } = loadProvider();
  sandbox.window.BOARD_STUDIO_CONFIG = {
    remoteEndpoint: { url: "https://example.com/generate", token: "t123" }
  };
  const calls = [];
  sandbox.fetch = async (url, opts) => {
    calls.push({ url, opts });
    return { ok: true, json: async () => ({ image: "QUJD" }) };
  };
  await provider.generate({ canvas: stubCanvas, prompt: "make it neat" });
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, "https://example.com/generate");
  assert.equal(calls[0].opts.method, "POST");
  assert.equal(calls[0].opts.headers.Authorization, "Bearer t123");
  const sent = JSON.parse(calls[0].opts.body);
  assert.deepEqual(sent, { image: "data:image/png;base64,QUJD", prompt: "make it neat" });
});

test("omits the Authorization header when no token is configured", async () => {
  const { provider, sandbox } = loadProvider();
  sandbox.window.BOARD_STUDIO_CONFIG = { remoteEndpoint: { url: "https://example.com/generate" } };
  const calls = [];
  sandbox.fetch = async (url, opts) => {
    calls.push(opts);
    return { ok: true, json: async () => ({ text: "done" }) };
  };
  await provider.generate({ canvas: stubCanvas, prompt: "" });
  assert.equal("Authorization" in calls[0].headers, false);
});

test("maps a base64 image response to an image result", async () => {
  const { provider, sandbox } = loadProvider();
  sandbox.window.BOARD_STUDIO_CONFIG = { remoteEndpoint: { url: "https://example.com/generate" } };
  sandbox.fetch = async () => ({ ok: true, json: async () => ({ image: "QUJD" }) });
  const result = await provider.generate({ canvas: stubCanvas, prompt: "" });
  assert.equal(result.kind, "image");
  assert.equal(result.dataUrl, "data:image/png;base64,QUJD");
  assert.equal(result.meta.model, true);
});

test("maps a text response to a text result", async () => {
  const { provider, sandbox } = loadProvider();
  sandbox.window.BOARD_STUDIO_CONFIG = { remoteEndpoint: { url: "https://example.com/generate" } };
  sandbox.fetch = async () => ({ ok: true, json: async () => ({ text: "<button>Hi</button>" }) });
  const result = await provider.generate({ canvas: stubCanvas, prompt: "" });
  assert.equal(result.kind, "text");
  assert.equal(result.text, "<button>Hi</button>");
});

test("rejects with the HTTP status on a failed response", async () => {
  const { provider, sandbox } = loadProvider();
  sandbox.window.BOARD_STUDIO_CONFIG = { remoteEndpoint: { url: "https://example.com/generate" } };
  sandbox.fetch = async () => ({ ok: false, status: 500, json: async () => ({}) });
  await assert.rejects(
    () => provider.generate({ canvas: stubCanvas, prompt: "" }),
    /HTTP 500/
  );
});

test("rejects when the response has neither image nor text", async () => {
  const { provider, sandbox } = loadProvider();
  sandbox.window.BOARD_STUDIO_CONFIG = { remoteEndpoint: { url: "https://example.com/generate" } };
  sandbox.fetch = async () => ({ ok: true, json: async () => ({ nope: true }) });
  await assert.rejects(
    () => provider.generate({ canvas: stubCanvas, prompt: "" }),
    /no image or text field/
  );
});
