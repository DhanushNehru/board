import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "index.html"), "utf8");

// Regression test for issue #86: the Google Identity Services script reads
// the g_id_onload element when it loads, but script.js used to set
// data-client_id only after an async fetch of config.json. Whenever the GIS
// script won that race, sign-in failed with "Error 400: Missing required
// parameter: client_id". The client_id must be static in the HTML.
test("g_id_onload carries a static data-client_id (no fetch race)", () => {
  const onload = html.match(/<span[^>]*id="g_id_onload"[^>]*>/);
  assert.ok(onload, "g_id_onload element must exist in index.html");
  assert.match(
    onload[0],
    /data-client_id="[^"]+\.apps\.googleusercontent\.com"/,
    "g_id_onload must declare data-client_id statically so GIS never initializes without it"
  );
});

test("static client_id matches config.json", () => {
  const config = JSON.parse(readFileSync(join(root, "config.json"), "utf8"));
  const onload = html.match(/<span[^>]*id="g_id_onload"[^>]*>/)[0];
  const staticId = onload.match(/data-client_id="([^"]+)"/)[1];
  assert.equal(staticId, config.client_id);
});
