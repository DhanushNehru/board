const canvas = document.getElementById("black-board");
const boardColorInp = document.getElementById("board-color");
const penColorInp = document.getElementById("pen-color");
const penThicknessInp = document.getElementById("pen-thickness");
const eraserBtn = document.getElementById("eraser-btn");
const eraserThicknessInp = document.getElementById("eraser-thickness");

let isEraserEnabled = false;

// Change board color
boardColorInp.addEventListener("change", (e) => {
  const color = e.target.value;
  canvas.style.backgroundColor = color;
});

// Change pen color and thickness
penColorInp.addEventListener("change", (e) => {
  const color = e.target.value;
  const context = canvas.getContext("2d");
  context.strokeStyle = color;
});

// Change pen thickness
penThicknessInp.addEventListener("input", (e) => {
  const thickness = e.target.value;
  const context = canvas.getContext("2d");
  context.lineWidth = thickness;
});

// Toggle eraser mode
eraserBtn.addEventListener("click", () => {
  isEraserEnabled = !isEraserEnabled;
  const context = canvas.getContext("2d");
  
  if (isEraserEnabled) {
    context.strokeStyle = "#FFFFFF"; // Change to background color for erasing
    eraserBtn.textContent = "Disable Eraser";
  } else {
    context.strokeStyle = penColorInp.value; // Switch back to pen color
    eraserBtn.textContent = "Enable Eraser";
  }
});

// Change eraser thickness
eraserThicknessInp.addEventListener("input", (e) => {
  const thickness = e.target.value;
  const context = canvas.getContext("2d");
  
  // Apply eraser thickness
  context.lineWidth = thickness;
});

