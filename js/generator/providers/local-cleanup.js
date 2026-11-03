/* Built-in local provider: deterministic sketch cleanup with a transparent
   background. It is NOT an AI model - it runs fully offline and always
   works, which makes it the safe default while no model is configured. */
(function () {
  "use strict";

  function toTransparentPng(canvas) {
    var width = canvas.width;
    var height = canvas.height;
    var ctx = canvas.getContext("2d");
    var imageData = ctx.getImageData(0, 0, width, height);
    var data = imageData.data;
    for (var i = 0; i < data.length; i += 4) {
      // The input is a binarized sketch: white paper becomes transparent,
      // dark ink becomes solid black.
      if (data[i] > 127) {
        data[i + 3] = 0;
      } else {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = 255;
      }
    }
    var out = document.createElement("canvas");
    out.width = width;
    out.height = height;
    out.getContext("2d").putImageData(imageData, 0, 0);
    return out.toDataURL("image/png");
  }

  function toSvg(canvas, pngDataUrl) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="' +
      canvas.width +
      '" height="' +
      canvas.height +
      '" viewBox="0 0 ' +
      canvas.width +
      " " +
      canvas.height +
      '"><image width="' +
      canvas.width +
      '" height="' +
      canvas.height +
      '" href="' +
      pngDataUrl +
      '"/></svg>';
    return "data:image/svg+xml;base64," + window.btoa(svg);
  }

  window.SketchGenerator.register({
    id: "local-cleanup",
    label: "Local cleanup (no model, offline)",
    description:
      "Deterministic cleanup: transparent-background PNG and SVG of your sketch. Not AI-generated.",
    usesModel: false,
    needsConfig: false,
    generate: function (request) {
      if (!request || !request.canvas) {
        return Promise.reject(new Error("Enhance a sketch first."));
      }
      var png = toTransparentPng(request.canvas);
      return Promise.resolve({
        kind: "image",
        dataUrl: png,
        svgDataUrl: toSvg(request.canvas, png),
        meta: {
          model: false,
          note: "Deterministic local cleanup. No model was used."
        }
      });
    }
  });
})();
