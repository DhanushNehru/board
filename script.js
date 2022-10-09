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
  ctx.strokeStyle = "#FFFFFF";
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
}