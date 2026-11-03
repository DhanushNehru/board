import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const source = readFileSync(join(root, "colorChanges.js"), "utf8");

test("eraser stroke uses the board colour input, not a hardcoded white", () => {
  assert.match(source, /boardColorInp/);
  assert.doesNotMatch(
    source,
    /strokeStyle\s*=\s*["']#FFFFFF["']/,
    "hardcoded white eraser stroke would ignore a non-white board"
  );
  assert.match(
    source,
    /boardStrokeColor|boardColorInp\.value/,
    "eraser must read the selected board colour"
  );
});

test("pen and eraser thickness are remembered separately", () => {
  assert.match(source, /let penThickness/);
  assert.match(source, /let eraserThickness/);
  assert.match(source, /penThickness\s*=\s*e\.target\.value/);
  assert.match(source, /eraserThickness\s*=\s*e\.target\.value/);
  // Pen input must not rewrite lineWidth while the eraser is active.
  assert.match(source, /if\s*\(\s*!isEraserEnabled\s*\)[\s\S]*lineWidth\s*=\s*penThickness/);
  assert.match(source, /if\s*\(\s*isEraserEnabled\s*\)[\s\S]*lineWidth\s*=\s*eraserThickness/);
});
