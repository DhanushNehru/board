const buttonDownload = document.getElementById("download");
buttonDownload.addEventListener("click", downloadOptions);

function download(name, format) {
  // get width and height and background color - original draw
  const canvas = document.getElementById("black-board");
  const width = canvas.width;
  const height = canvas.height;

  let boardBackground;

  const background = canvas.style.backgroundColor;
  boardBackground = background;

  if (!background) {
    boardBackground = "rgba(255,255,255)";
  }

  // generate a new canvas with background
  const backgroundCanvasGenerate = document.createElement("canvas");
  backgroundCanvasGenerate.width = width;
  backgroundCanvasGenerate.height = height;
  const ctx2 = backgroundCanvasGenerate.getContext("2d");
  ctx2.fillStyle = boardBackground;
  ctx2.fillRect(0, 0, width, height);

  // merge background with draw
  const canvas3 = document.createElement("canvas");
  canvas3.width = width;
  canvas3.height = height;
  const ctx3 = canvas3.getContext("2d");

  ctx3.drawImage(backgroundCanvasGenerate, 0, 0);
  ctx3.drawImage(canvas, 0, 0);

  const newCanvas = canvas3.toDataURL();

  fetch(newCanvas)
    .then((resp) => resp.blob())
    .then((blobobject) => {
      const blob = window.URL.createObjectURL(blobobject);
      const anchor = document.createElement("a");
      anchor.style.display = "none";
      anchor.href = blob;
      anchor.download = `${name}.${format}`;
      document.body.appendChild(anchor);
      anchor.click();
      window.URL.revokeObjectURL(blob);

      document.getElementById("modal").remove();
    });
}

function downloadOptions() {
  const modal = document.createElement("div");
  modal.classList.add("modal");
  modal.setAttribute("id", "modal");

  const content = document.createElement("div");
  content.classList.add("modal-content");
  modal.appendChild(content);

  const labelInput = document.createElement("div");

  labelInput.classList.add("label-input");

  const label = document.createElement("label");
  label.appendChild(document.createTextNode("File Name"));
  labelInput.appendChild(label);

  const inputName = document.createElement("input");
  inputName.addEventListener("keydown", () => {
    const error = inputName.classList.contains("error");
    if (error) {
      inputName.classList.remove("error");
    }
  });
  inputName.classList.add("input-name");
  labelInput.appendChild(inputName);

  content.appendChild(labelInput);

  const formats = ["png", "jpeg"];

  const listFormats = document.createElement("div");
  listFormats.classList.add("download-list-formats");
  content.appendChild(listFormats);

  formats.map((format) => {
    const label = document.createElement("label");
    label.classList.add("download-format-control");

    const input = document.createElement("input");
    if (format == "png") {
      input.checked = true;
    }
    input.setAttribute("type", "radio");
    input.setAttribute("name", "radio");
    input.setAttribute("value", format);
    label.appendChild(document.createTextNode(format));
    label.appendChild(input);

    listFormats.appendChild(label);
  });

  const downloadCancel = document.createElement("div");
  downloadCancel.classList.add("download-cancel");

  const btnDownload = document.createElement("button");
  btnDownload.addEventListener("click", () => {
    let nameFile = inputName.value;

    if (!nameFile) {
      inputName.classList.add("error");
      return;
    }

    nameFile = nameFile.replace(/\s+/g, "-").toLowerCase();

    const format = document.querySelector('input[name="radio"]:checked').value;

    download(nameFile, format);
  });

  btnDownload.classList.add("btn-download");
  btnDownload.appendChild(document.createTextNode("Download"));
  downloadCancel.appendChild(btnDownload);

  const btnCancelClose = document.createElement("button");
  btnCancelClose.classList.add("btn-cancel");
  btnCancelClose.addEventListener("click", () => {
    modal.remove();
  });
  btnCancelClose.appendChild(document.createTextNode("Cancel"));
  downloadCancel.appendChild(btnCancelClose);

  content.appendChild(downloadCancel);

  document.body.appendChild(modal);
}

function blackBoard() {
  const canvas = document.getElementById("black-board");
  const ctx = canvas.getContext("2d");
  const strokeInp = document.getElementById("stroke");

  //resizing
  canvas.width = canvas.getBoundingClientRect().width;
  canvas.height = canvas.getBoundingClientRect().height;

  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#000000";
  //variables
  let painting = false;
  let lastX = 0;
  let lastY = 0;

  //functions
  function startPosition(e) {
    painting = true;
    draw(e);
  }

  function endPosition() {
    painting = false;
    ctx.beginPath();
  }

  function draw(e) {
    if (!painting) {
      return;
    }

    e.preventDefault();
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    if (e.type == "touchmove") {
      console.log(e.touches[0]);
      ctx.lineTo(e.touches[0].clientX, e.touches[0].clientY);
    } else {
      ctx.lineTo(e.offsetX, e.offsetY);
    }

    if (e.type == "touchmove") {
      lastX = e.touches[0].clientX;
      lastY = e.touches[0].clientY;
    } else {
      lastX = e.offsetX;
      lastY = e.offsetY;
    }
    ctx.stroke();

    saveCanvas();
  }

  function saveCanvas() {
    localStorage.setItem("myCanvas", canvas.toDataURL());
  }

  //event listeners
  canvas.addEventListener("mousedown", (event) => {
    ctx.lineWidth = strokeInp.value
    painting = true;
    lastX = event.offsetX;
    lastY = event.offsetY;
  });
  canvas.addEventListener("touchstart", (event) => {
    ctx.lineWidth = strokeInp.value
    painting = true;
    lastX = event.touches[0].clientX;
    lastY = event.touches[0].clientY;
  });
  canvas.addEventListener("mouseup", endPosition);
  canvas.addEventListener("touchend", endPosition);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("touchmove", draw);
}

function circle() {
  const canvas = document.getElementById("black-board");
  const penColor = document.getElementById("pen-color");
  const strokeInp = document.getElementById("stroke");
  const ctx = canvas.getContext("2d", {
    willReadFrequently: true,
  });
  let snapshot;

  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.lineWidth = 2;
  ctx.strokeStyle = "#FFFFFF";

  let painting = false;
  let lastX = 0;
  let lastY = 0;

  function endPosition() {
    painting = false;
    ctx.beginPath();
    canvas.removeEventListener("mousemove", draw);
    canvas.removeEventListener("touchmove", draw);
  }

  function get_radius(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
  }

  function draw(e) {
    if (!painting) {
      return;
    }

    e.preventDefault();
    ctx.beginPath();
    ctx.putImageData(snapshot, 0, 0)
    ctx.arc(lastX, lastY, get_radius(lastX, lastY, e.offsetX, e.offsetY), 0, Math.PI * 2);
    ctx.stroke();
  }

  //event listeners
  canvas.addEventListener("mousedown", (event) => {
    ctx.strokeStyle = penColor.value
    ctx.lineWidth = strokeInp.value
    painting = true;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    lastX = event.offsetX;
    lastY = event.offsetY;
  });
  canvas.addEventListener("touchstart", (event) => {
    ctx.strokeStyle = penColor.value
    ctx.lineWidth = strokeInp.value
    painting = true;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
    lastX = event.touches[0].clientX;
    lastY = event.touches[0].clientY;
  });
  canvas.addEventListener("mouseup", endPosition);
  canvas.addEventListener("touchend", endPosition);
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("touchmove", draw);
}

function onClear() {
  const canvas = document.getElementById("black-board");
  const context = canvas.getContext("2d");

  context.clearRect(0, 0, canvas.width, canvas.height);

  localStorage.setItem("myCanvas", null);
}

function loadCanvas() {
  if (localStorage.getItem("myCanvas") !== "null") {
    const canvas = document.getElementById("black-board");
    const ctx = canvas.getContext("2d");

    const dataURL = localStorage.getItem("myCanvas");

    let img = new Image();

    img.src = dataURL;
    img.onload = function () {
      ctx.drawImage(img, 0, 0);
    };
  }
}

loadCanvas();

blackBoard();
