// Undo history tests. They run the real script.js in Node with a stubbed DOM,
// localStorage and Image (the same approach as remote-endpoint.test.mjs), and
// verify the reload acceptance criteria from issue #95: after a reload, one
// undo removes the last stroke, undos land back on the restored image, and
// undoing past the base clears the board predictably.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

function makeSandbox(seed = {}) {
  const storage = new Map(Object.entries(seed));
  const localStorage = {
    getItem: (key) => (storage.has(key) ? storage.get(key) : null),
    setItem: (key, value) => storage.set(key, String(value)),
    removeItem: (key) => storage.delete(key),
  };

  const drawn = []; // every drawImage, as the source that was drawn
  const cleared = [];

  const ctx = {
    beginPath() {},
    moveTo() {},
    lineTo() {},
    stroke() {},
    clearRect() {
      cleared.push(true);
    },
    drawImage(img) {
      drawn.push(img._src);
    },
  };
  ctx.lineJoin = ctx.lineCap = ctx.lineWidth = ctx.strokeStyle = undefined;

  const board = {
    width: 100,
    height: 100,
    toDataURL: () => "data:canvas-current",
    getContext: () => ctx,
    addEventListener() {},
    getBoundingClientRect: () => ({ width: 100, height: 100 }),
  };

  const element = () => ({
    addEventListener() {},
    style: {},
    textContent: "",
    firstElementChild: { src: "" },
  });

  const document = {
    getElementById(id) {
      return id === "black-board" ? board : element();
    },
    addEventListener() {},
    querySelector: () => element(),
    createElement: () => element(),
    body: { appendChild() {} },
  };

  class Image {
    set src(value) {
      this._src = value;
      // loadCanvas sets onload after src, so fire it one microtask later
      queueMicrotask(() => {
        if (this.onload) this.onload();
      });
    }
    get src() {
      return this._src;
    }
  }

  const sandbox = {
    document,
    localStorage,
    Image,
    window: { addEventListener() {} },
    alert() {},
    console: { log() {} },
    parseJwt: () => ({}),
  };
  return { sandbox, storage, drawn, cleared, board };
}

function loadScript(sandbox) {
  const root = dirname(fileURLToPath(import.meta.url));
  const source = readFileSync(join(root, "..", "script.js"), "utf8");
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
}

function dataStub(value) {
  return { toDataURL: () => value };
}

const settle = () => new Promise((resolve) => setImmediate(resolve));

test("after a reload, undo removes the last stroke, lands on the restored image, then clears", async () => {
  const { sandbox, storage, drawn, cleared } = makeSandbox({
    email: "user@example.com",
    "myCanvas_user@example.com": "data:base",
  });
  loadScript(sandbox);
  await settle();

  // loadCanvas ran at load: the persisted image seeded the history
  assert.deepEqual([...sandbox.drawArray], ["data:base"]);
  assert.equal(sandbox.drawStep, 0);

  // two new strokes after the reload
  sandbox.pushCanvas(dataStub("data:stroke-1"));
  sandbox.pushCanvas(dataStub("data:stroke-2"));
  assert.equal(sandbox.drawStep, 2);

  // one undo removes the last stroke
  sandbox.onUndo();
  await settle();
  assert.equal(sandbox.drawStep, 1);
  // drawn[0] is loadCanvas restoring the persisted image
  assert.deepEqual(drawn, ["data:base", "data:stroke-1"]);
  assert.equal(storage.get("myCanvas_user@example.com"), "data:canvas-current");

  // the next undo lands on the restored image
  sandbox.onUndo();
  await settle();
  assert.equal(sandbox.drawStep, 0);
  assert.deepEqual(drawn, ["data:base", "data:stroke-1", "data:base"]);

  // undoing past the base clears the board instead of crashing or restoring
  sandbox.onUndo();
  await settle();
  assert.equal(sandbox.drawStep, -1);
  assert.equal(cleared.length, 3);
  assert.equal(storage.get("myCanvas_user@example.com"), "null");

  // and undoing with nothing left is a no-op
  sandbox.onUndo();
  await settle();
  assert.equal(sandbox.drawStep, -1);
  assert.deepEqual(drawn, ["data:base", "data:stroke-1", "data:base"]);
});
