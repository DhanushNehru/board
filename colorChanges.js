const canvas = document.getElementById("black-board");
const boardColorInp = document.getElementById("board-color");
const penColorInp = document.getElementById("pen-color");
const penThicknessInp = document.getElementById("pen-thickness");
const eraserBtn = document.getElementById("eraser-btn");
const eraserThicknessInp = document.getElementById("eraser-thickness");

let isEraserEnabled = false;
// Pen and eraser each keep their own thickness; context.lineWidth alone
// used to make the two controls overwrite each other (#97).
let penThickness = penThicknessInp?.value ?? "2";
let eraserThickness = eraserThicknessInp?.value ?? "10";

function boardStrokeColor() {
  return boardColorInp?.value || "#FFFFFF";
}

function applyActiveToolStyle() {
  const context = canvas.getContext("2d");
  if (isEraserEnabled) {
    context.strokeStyle = boardStrokeColor();
    context.lineWidth = eraserThickness;
  } else {
    context.strokeStyle = penColorInp.value;
    context.lineWidth = penThickness;
  }
}

// Change board color
boardColorInp.addEventListener("change", (e) => {
  const color = e.target.value;
  canvas.style.backgroundColor = color;
  // Eraser paints with the board colour (#94).
  if (isEraserEnabled) {
    canvas.getContext("2d").strokeStyle = color;
  }
});

// Change pen color and thickness
penColorInp.addEventListener("change", (e) => {
  const color = e.target.value;
  if (!isEraserEnabled) {
    canvas.getContext("2d").strokeStyle = color;
  }
});

// Change pen thickness
penThicknessInp.addEventListener("input", (e) => {
  penThickness = e.target.value;
  if (!isEraserEnabled) {
    canvas.getContext("2d").lineWidth = penThickness;
  }
});

// Toggle eraser mode
eraserBtn.addEventListener("click", () => {
  isEraserEnabled = !isEraserEnabled;
  if (isEraserEnabled) {
    eraserBtn.textContent = "Disable Eraser";
  } else {
    eraserBtn.textContent = "Enable Eraser";
  }
  applyActiveToolStyle();
});

// Change eraser thickness
eraserThicknessInp.addEventListener("input", (e) => {
  eraserThickness = e.target.value;
  if (isEraserEnabled) {
    canvas.getContext("2d").lineWidth = eraserThickness;
  }
});
