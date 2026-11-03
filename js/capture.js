/* Capture and preprocessing helpers for photos of hand-drawn sketches.
   Everything runs locally in the browser: no uploads, no dependencies. */
(function () {
  "use strict";

  var MAX_SIDE = 1600;

  function loadImageFromFile(file) {
    return new Promise(function (resolve, reject) {
      if (!file || !file.type || file.type.indexOf("image/") !== 0) {
        reject(new Error("Please choose an image file."));
        return;
      }
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = function () {
        URL.revokeObjectURL(url);
        reject(new Error("That file could not be read as an image."));
      };
      img.src = url;
    });
  }

  function drawToCanvas(img, maxSide) {
    var limit = maxSide || MAX_SIDE;
    var scale = Math.min(1, limit / Math.max(img.naturalWidth, img.naturalHeight));
    var canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  }

  function getGrayscale(ctx, width, height) {
    var data = ctx.getImageData(0, 0, width, height).data;
    var gray = new Uint8ClampedArray(width * height);
    for (var i = 0; i < gray.length; i++) {
      var o = i * 4;
      gray[i] = 0.299 * data[o] + 0.587 * data[o + 1] + 0.114 * data[o + 2];
    }
    return gray;
  }

  function stretchContrast(gray) {
    var min = 255;
    var max = 0;
    var i;
    for (i = 0; i < gray.length; i++) {
      if (gray[i] < min) min = gray[i];
      if (gray[i] > max) max = gray[i];
    }
    if (max - min < 10) return gray;
    var span = max - min;
    var out = new Uint8ClampedArray(gray.length);
    for (i = 0; i < gray.length; i++) {
      out[i] = ((gray[i] - min) * 255) / span;
    }
    return out;
  }

  /* Otsu's method: pick the threshold that best separates paper from ink. */
  function otsuThreshold(gray) {
    var hist = new Array(256).fill(0);
    for (var i = 0; i < gray.length; i++) hist[gray[i]]++;
    var total = gray.length;
    var sum = 0;
    for (var t = 0; t < 256; t++) sum += t * hist[t];
    var sumB = 0;
    var wB = 0;
    var best = 0;
    var bestT = 127;
    for (var th = 0; th < 256; th++) {
      wB += hist[th];
      if (wB === 0) continue;
      var wF = total - wB;
      if (wF === 0) break;
      sumB += th * hist[th];
      var mB = sumB / wB;
      var mF = (sum - sumB) / wF;
      var between = wB * wF * (mB - mF) * (mB - mF);
      if (between > best) {
        best = between;
        bestT = th;
      }
    }
    return bestT;
  }

  function findInkBounds(gray, width, height, threshold) {
    var pad = 8;
    var minX = width;
    var minY = height;
    var maxX = -1;
    var maxY = -1;
    for (var y = 0; y < height; y++) {
      for (var x = 0; x < width; x++) {
        if (gray[y * width + x] < threshold) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < 0) return null;
    return {
      x: Math.max(0, minX - pad),
      y: Math.max(0, minY - pad),
      width: Math.min(width, maxX + pad + 1) - Math.max(0, minX - pad),
      height: Math.min(height, maxY + pad + 1) - Math.max(0, minY - pad)
    };
  }

  /* Turn a photo of a sketch into a clean, cropped black-on-white canvas.
     options.threshold: 0 means auto (Otsu). */
  function preprocess(sourceCanvas, options) {
    var opts = options || {};
    var width = sourceCanvas.width;
    var height = sourceCanvas.height;
    var ctx = sourceCanvas.getContext("2d");
    var gray = stretchContrast(getGrayscale(ctx, width, height));
    var threshold = opts.threshold && opts.threshold > 0 ? opts.threshold : otsuThreshold(gray);
    var bounds = findInkBounds(gray, width, height, threshold);
    if (!bounds) {
      bounds = { x: 0, y: 0, width: width, height: height };
    }
    var out = document.createElement("canvas");
    out.width = bounds.width;
    out.height = bounds.height;
    var outCtx = out.getContext("2d");
    var outData = outCtx.createImageData(bounds.width, bounds.height);
    for (var y = 0; y < bounds.height; y++) {
      for (var x = 0; x < bounds.width; x++) {
        var g = gray[(bounds.y + y) * width + (bounds.x + x)];
        var v = g < threshold ? 0 : 255;
        var o = (y * bounds.width + x) * 4;
        outData.data[o] = v;
        outData.data[o + 1] = v;
        outData.data[o + 2] = v;
        outData.data[o + 3] = 255;
      }
    }
    outCtx.putImageData(outData, 0, 0);
    return { canvas: out, threshold: threshold, bounds: bounds };
  }

  function startCamera(videoEl) {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return Promise.reject(new Error("Camera capture is not supported in this browser."));
    }
    return navigator.mediaDevices
      .getUserMedia({ video: { facingMode: "environment" } })
      .then(function (stream) {
        videoEl.srcObject = stream;
        return videoEl.play().then(function () {
          return stream;
        });
      });
  }

  function stopCamera(stream, videoEl) {
    if (stream) {
      stream.getTracks().forEach(function (track) {
        track.stop();
      });
    }
    if (videoEl) videoEl.srcObject = null;
  }

  window.BoardCapture = {
    loadImageFromFile: loadImageFromFile,
    drawToCanvas: drawToCanvas,
    preprocess: preprocess,
    startCamera: startCamera,
    stopCamera: stopCamera
  };
})();
