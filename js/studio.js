/* Wires up the Sketch Studio section: capture, enhance, generate. */
(function () {
  "use strict";

  var fileInput = document.getElementById("studio-file");
  var cameraBtn = document.getElementById("studio-camera-btn");
  var snapBtn = document.getElementById("studio-snap-btn");
  var video = document.getElementById("studio-video");
  var rawCanvas = document.getElementById("studio-raw");
  var cleanCanvas = document.getElementById("studio-clean");
  var thresholdInput = document.getElementById("studio-threshold");
  var enhanceBtn = document.getElementById("studio-enhance-btn");
  var providerSelect = document.getElementById("studio-provider");
  var promptInput = document.getElementById("studio-prompt");
  var generateBtn = document.getElementById("studio-generate-btn");
  var statusEl = document.getElementById("studio-status");
  var outputEl = document.getElementById("studio-output");

  if (!fileInput || !window.BoardCapture || !window.SketchGenerator) {
    return;
  }

  var sourceCanvas = null;
  var cameraStream = null;

  function setStatus(message, isError) {
    statusEl.textContent = message;
    statusEl.classList.toggle("studio-error", Boolean(isError));
  }

  function fitPreview(source, target) {
    target.width = source.width;
    target.height = source.height;
    target.getContext("2d").drawImage(source, 0, 0);
  }

  function showSource(canvas) {
    sourceCanvas = canvas;
    fitPreview(canvas, rawCanvas);
    enhanceBtn.disabled = false;
    generateBtn.disabled = true;
    setStatus("Sketch loaded. Choose Enhance to clean it up.");
  }

  function loadConfig() {
    return fetch("config.local.json")
      .then(function (response) {
        return response.ok ? response.json() : {};
      })
      .catch(function () {
        return {};
      })
      .then(function (cfg) {
        window.BOARD_STUDIO_CONFIG = cfg;
      });
  }

  function populateProviders() {
    window.SketchGenerator.list().forEach(function (p) {
      var option = document.createElement("option");
      option.value = p.id;
      option.textContent = p.label + (p.needsConfig && !p.isReady ? " (setup needed)" : "");
      providerSelect.appendChild(option);
    });
  }

  fileInput.addEventListener("change", function (event) {
    var file = event.target.files && event.target.files[0];
    if (!file) return;
    window.BoardCapture.loadImageFromFile(file)
      .then(function (img) {
        showSource(window.BoardCapture.drawToCanvas(img));
      })
      .catch(function (error) {
        setStatus(error.message, true);
      });
  });

  cameraBtn.addEventListener("click", function () {
    window.BoardCapture.startCamera(video)
      .then(function (stream) {
        cameraStream = stream;
        video.hidden = false;
        snapBtn.disabled = false;
        setStatus("Camera on. Frame the sketch and choose Capture photo.");
      })
      .catch(function (error) {
        setStatus("Could not start the camera: " + error.message, true);
      });
  });

  snapBtn.addEventListener("click", function () {
    if (!cameraStream) return;
    var canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    window.BoardCapture.stopCamera(cameraStream, video);
    cameraStream = null;
    video.hidden = true;
    snapBtn.disabled = true;
    showSource(window.BoardCapture.drawToCanvas(canvas));
  });

  enhanceBtn.addEventListener("click", function () {
    if (!sourceCanvas) return;
    var threshold = parseInt(thresholdInput.value, 10);
    var result = window.BoardCapture.preprocess(sourceCanvas, { threshold: threshold });
    fitPreview(result.canvas, cleanCanvas);
    generateBtn.disabled = false;
    setStatus(
      "Cleanup applied (threshold " +
        result.threshold +
        (threshold > 0 ? ", manual" : ", auto") +
        "). Pick a provider and choose Generate."
    );
  });

  generateBtn.addEventListener("click", function () {
    var providerId = providerSelect.value;
    outputEl.innerHTML = "";
    generateBtn.disabled = true;
    setStatus("Generating...");
    window.SketchGenerator.generate(providerId, {
      canvas: cleanCanvas,
      prompt: promptInput.value.trim(),
      onProgress: setStatus
    })
      .then(function (result) {
        if (result.kind === "image") {
          var img = document.createElement("img");
          img.src = result.dataUrl;
          img.alt = "Generated result";
          img.className = "studio-result";
          outputEl.appendChild(img);
          var link = document.createElement("a");
          link.href = result.dataUrl;
          link.download = "sketch-result.png";
          link.textContent = "Download result";
          link.className = "studio-download";
          outputEl.appendChild(link);
        } else {
          var pre = document.createElement("pre");
          pre.className = "studio-text-result";
          pre.textContent = result.text;
          outputEl.appendChild(pre);
        }
        var note = result.meta && result.meta.note ? " " + result.meta.note : "";
        setStatus("Done." + note);
      })
      .catch(function (error) {
        setStatus(error.message, true);
      })
      .finally(function () {
        generateBtn.disabled = false;
      });
  });

  loadConfig().then(populateProviders);
})();
