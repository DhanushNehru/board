# Model providers for Sketch Studio

Sketch Studio can send an enhanced sketch to a generation provider. Providers
are pluggable, and everything works without one: the built-in local provider
cleans sketches offline with no model and no network calls.

## How a provider works

A provider is a small JavaScript object registered on `window.SketchGenerator`:

```js
window.SketchGenerator.register({
  id: "my-provider",          // unique id
  label: "My provider",       // shown in the dropdown
  description: "What it does",
  usesModel: true,            // does it call an AI model?
  needsConfig: true,          // does it need config.local.json?
  isReady: function () {
    return true;              // return false until configured
  },
  generate: function (request) {
    // request.canvas  - the enhanced sketch canvas
    // request.prompt  - the user's optional prompt text
    // request.onProgress(message) - optional progress callback
    // Resolve with one of:
    //   { kind: "image", dataUrl: "data:image/png;base64,..." }
    //   { kind: "text", text: "..." }
    return Promise.resolve({ kind: "text", text: "hello" });
  }
});
```

Add your file under `js/generator/providers/` and include it with a
`<script>` tag in `index.html` after `js/generator/registry.js`.

## Configuring the remote endpoint provider

`js/generator/providers/remote-endpoint.js` posts the enhanced sketch and
prompt as JSON to an endpoint you run or have free access to:

```
POST <url>
{ "image": "data:image/png;base64,...", "prompt": "..." }
```

It expects a JSON response with either an `image` field (base64 or data URL)
or a `text` field.

Configuration lives in `config.local.json` (copy
`config.local.json.example`), which is gitignored:

```json
{
  "remoteEndpoint": {
    "url": "https://your-endpoint.example.com/generate",
    "token": "optional-bearer-token"
  }
}
```

## Rules

- **Never commit credentials.** Tokens belong in `config.local.json` only.
- **Free options only.** Use endpoints that are free to run: a local model
  server on your own machine, or a hosted free tier. Do not wire the project
  to paid APIs by default.
- **Be honest in labels.** If a provider does not use a model, say so in its
  `label` and `description`.
- **Fail gracefully.** Reject the promise with a readable error message; the
  UI shows it in the status line.

## A free local path, end to end

One concrete free setup, no accounts and no paid services:

1. Install [AUTOMATIC1111 Stable Diffusion WebUI](https://github.com/AUTOMATIC1111/stable-diffusion-webui)
   (or any compatible local image server) and start it with `--api`.
2. Run the example adapter, which translates the contract into the WebUI
   `img2img` API:

   ```
   node docs/examples/local-endpoint.example.mjs
   ```

3. Copy `config.local.json.example` to `config.local.json` and set:

   ```json
   { "remoteEndpoint": { "url": "http://localhost:8787/generate", "token": "" } }
   ```

4. Reload the page, pick "Remote model endpoint (your own)" in Sketch
   Studio, enhance a sketch and generate.

The request and response shapes are the contract defined above. The adapter
is an example for contributors, not part of the app.

## What is tested

`tests/remote-endpoint.test.mjs` runs the real provider file (run locally with `node --test "tests/*.test.mjs"`) in Node with a
mocked `fetch` and checks the request/response contract: request shape,
optional auth header, image and text results, and error handling. These are
contract tests only - they do not call a real model. Running against a live
local model server is covered by the walkthrough above.
