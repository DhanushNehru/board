/* Registry for sketch generation providers.
   A provider turns a cleaned-up sketch (plus an optional prompt) into an
   output such as an image or markup. Providers can be fully local or call
   a user-configured endpoint; see docs/model-providers.md. */
(function () {
  "use strict";

  var providers = {};

  function register(provider) {
    if (!provider || !provider.id || !provider.label || typeof provider.generate !== "function") {
      throw new Error("A provider needs an id, a label and a generate() function.");
    }
    providers[provider.id] = provider;
  }

  function list() {
    return Object.keys(providers).map(function (id) {
      var p = providers[id];
      return {
        id: p.id,
        label: p.label,
        description: p.description || "",
        usesModel: Boolean(p.usesModel),
        needsConfig: Boolean(p.needsConfig),
        isReady: typeof p.isReady === "function" ? p.isReady() : true
      };
    });
  }

  function get(id) {
    return providers[id] || null;
  }

  /* request: { canvas, prompt, onProgress } -> Promise<{ kind, dataUrl?, text?, meta }> */
  function generate(id, request) {
    var provider = get(id);
    if (!provider) {
      return Promise.reject(new Error("Unknown provider: " + id));
    }
    if (typeof provider.isReady === "function" && !provider.isReady()) {
      return Promise.reject(
        new Error(provider.notReadyReason || "This provider is not configured yet.")
      );
    }
    return Promise.resolve().then(function () {
      return provider.generate(request);
    });
  }

  window.SketchGenerator = {
    register: register,
    list: list,
    get: get,
    generate: generate
  };
})();
