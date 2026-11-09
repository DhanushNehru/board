import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

function createStudio(cameraError) {
  const elements = new Map();
  function element(id) {
    if (!elements.has(id)) {
      const handlers = new Map();
      elements.set(id, {
        id, handlers, textContent: "", hidden: true, disabled: false,
        files: [], classList: {
          value: new Set(),
          toggle(name, active) {
            if (active) this.value.add(name);
            else this.value.delete(name);
          }
        },
        addEventListener(name, fn) { handlers.set(name, fn); },
        appendChild() {},
        getContext() { return { drawImage() {} }; }
      });
    }
    return elements.get(id);
  }
  const sandbox = {
    document: { getElementById: element, createElement: () => element("created") },
    window: {
      BoardCapture: {
        startCamera: async () => { throw cameraError; },
        loadImageFromFile: async () => ({ naturalWidth: 1, naturalHeight: 1 }),
        drawToCanvas: () => ({ width: 1, height: 1 })
      },
      SketchGenerator: { list: () => [], generate: async () => ({ kind: "text", text: "" }) }
    },
    fetch: async () => ({ ok: true, json: async () => ({}) }),
    Promise, Error, Boolean, parseInt
  };
  vm.runInNewContext(readFileSync(new URL("../js/studio.js", import.meta.url), "utf8"), sandbox);
  return { element };
}

async function clickCamera(studio) {
  studio.element("studio-camera-btn").handlers.get("click")();
  await new Promise(resolve => setImmediate(resolve));
  return studio.element("studio-status");
}

test("camera permission denial provides guidance and preserves file upload", async () => {
  const denial = Object.assign(new Error("Permission denied"), { name: "NotAllowedError" });
  const studio = createStudio(denial);
  const status = await clickCamera(studio);
  assert.match(status.textContent, /permission|access/i);
  assert.match(status.textContent, /browser|settings/i);
  assert.match(status.textContent, /upload|file/i);
  assert.equal(status.classList.value.has("studio-error"), true);
  assert.equal(studio.element("studio-file").disabled, false);
  assert.equal(typeof studio.element("studio-file").handlers.get("change"), "function");
});

test("other camera failures still report their actual error", async () => {
  const studio = createStudio(Object.assign(new Error("Device unavailable"), { name: "NotReadableError" }));
  const status = await clickCamera(studio);
  assert.match(status.textContent, /Device unavailable/);
});
