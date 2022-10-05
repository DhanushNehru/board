function blackBoard() {
  const canvas = document.getElementById("black-board");
  const context = canvas.getContext("2d");

  canvas.width = canvas.getBoundingClientRect().width;
  canvas.height = canvas.getBoundingClientRect().height;

  context.lineJoin = "round";
  context.lineCap = "round";
  context.lineWidth = 2;
  context.strokeStyle = "#FFFFFF";

  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;

  function draw(event) {
    if (isDrawing) {
      context.beginPath();
      context.moveTo(lastX, lastY);
      context.lineTo(event.offsetX, event.offsetY);
      context.stroke();
      lastX = event.offsetX;
      lastY = event.offsetY;
    } else {
      return;
    }
  }

  function touchStart(event) {
    event.preventDefault();
    context.beginPath();
  }

  function touchMove(event) {
    if (isDrawing) {
      context.moveTo(lastX, lastY);
      context.lineTo(event.touches[0].pageX, event.touches[0].pageY);
      context.stroke();
      lastX = event.touches[0].pageX;
      lastY = event.touches[0].pageY;
    } else {
      return;
    }
  }

  canvas.addEventListener("mousedown", (event) => {
    isDrawing = true;
    lastX = event.offsetX;
    lastY = event.offsetY;
  });
  canvas.addEventListener("mousemove", draw);
  canvas.addEventListener("mouseup", () => (isDrawing = false));
  canvas.addEventListener("mouseout", () => (isDrawing = false));

  canvas.addEventListener("touchstart", (event) => {
    isDrawing = true;
    lastX = event.touches[0].pageX;
    lastY = event.touches[0].pageY;
  });
  canvas.addEventListener("touchmove", touchMove);
  canvas.addEventListener("touchend", () => (isDrawing = false));
  canvas.addEventListener("touchcancel", () => (isDrawing = false));
}
