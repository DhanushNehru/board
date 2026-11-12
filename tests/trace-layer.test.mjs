import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import vm from "node:vm";

const source = readFileSync(new URL("../script.js", import.meta.url), "utf8");

function setup() {
  const storage = new Map();
  const cleared = [];
  const elements = new Map();
  const element = (id) => {
    if (!elements.has(id)) elements.set(id, {
      width: 100, height: 100, style: {},
      addEventListener() {},
      getBoundingClientRect: () => ({ width: 100, height: 100 }),
      toDataURL: () => "data:image/png;base64,board",
      getContext: () => ({
        clearRect: () => cleared.push(id),
        drawImage() {}, beginPath() {},
      }),
    });
    return elements.get(id);
  };
  class Image {
    set src(value) {
      this.value = value;
      if (this.onload) this.onload();
    }
  }
  const sandbox = {
    document: { getElementById: element, addEventListener() {} },
    localStorage: {
      getItem: (key) => storage.get(key) ?? null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: (key) => storage.delete(key),
    },
    window: { addEventListener() {} }, Image, console,
  };
  vm.createContext(sandbox);
  vm.runInContext(source, sandbox);
  sandbox.loadTraceLayer("data:image/png;base64,trace");
  assert.equal(element("trace-active-indicator").style.display, "inline-block");
  cleared.length = 0;
  return { sandbox, storage, element, cleared };
}

for (const action of ["onClear", "onRemoveTrace"]) {
  test(`${action} clears trace pixels, storage, button and active badge`, () => {
    const { sandbox, storage, element, cleared } = setup();
    sandbox[action]();
    assert.ok(cleared.includes("trace-layer"));
    assert.equal(storage.has("boardTraceLayer"), false);
    assert.equal(element("remove-trace-btn").style.display, "none");
    assert.equal(element("trace-active-indicator").style.display, "none");
    if (action === "onClear") assert.ok(cleared.includes("black-board"));
    sandbox.restoreTraceLayer();
    assert.equal(element("trace-active-indicator").style.display, "none");
  });
}
