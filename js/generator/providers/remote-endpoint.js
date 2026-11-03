/* Optional provider that posts the cleaned sketch to a model endpoint you
   configure yourself. The endpoint URL and token live in config.local.json,
   which is gitignored - never commit real credentials. Free and self-hosted
   endpoints only; see docs/model-providers.md. */
(function () {
  "use strict";

  function config() {
    var all = window.BOARD_STUDIO_CONFIG || {};
    return all.remoteEndpoint || {};
  }

  window.SketchGenerator.register({
    id: "remote-endpoint",
    label: "Remote model endpoint (your own)",
    description:
      "Sends the enhanced sketch and prompt to an endpoint you configure in config.local.json.",
    usesModel: true,
    needsConfig: true,
    notReadyReason:
      "Add config.local.json with a remoteEndpoint URL to use this provider. See docs/model-providers.md.",
    isReady: function () {
      return Boolean(config().url);
    },
    generate: function (request) {
      if (!request || !request.canvas) {
        return Promise.reject(new Error("Enhance a sketch first."));
      }
      var cfg = config();
      var headers = { "Content-Type": "application/json" };
      if (cfg.token) {
        headers.Authorization = "Bearer " + cfg.token;
      }
      if (typeof request.onProgress === "function") {
        request.onProgress("Contacting your endpoint...");
      }
      return fetch(cfg.url, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          image: request.canvas.toDataURL("image/png"),
          prompt: request.prompt || ""
        })
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("The endpoint returned HTTP " + response.status + ".");
          }
          return response.json();
        })
        .then(function (result) {
          if (result && result.image) {
            var dataUrl =
              typeof result.image === "string" && result.image.indexOf("data:") === 0
                ? result.image
                : "data:image/png;base64," + result.image;
            return { kind: "image", dataUrl: dataUrl, meta: { model: true } };
          }
          if (result && result.text) {
            return { kind: "text", text: result.text, meta: { model: true } };
          }
          throw new Error("The endpoint response had no image or text field.");
        });
    }
  });
})();
