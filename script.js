function blackBoard() {
  const canvas = document.getElementById("black-board");
  const ctx = canvas.getContext("2d");

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
  }

  //event listeners
  canvas.addEventListener("mousedown", (event) => {
    painting = true;
    lastX = event.offsetX;
    lastY = event.offsetY;
  });
  canvas.addEventListener("touchstart", (event) => {
    painting = true;
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
