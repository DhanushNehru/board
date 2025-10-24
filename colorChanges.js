const canvas = document.getElementById("black-board");
const boardColorInp = document.getElementById("board-color");
const penColorInp = document.getElementById("pen-color");
const penThicknessInp = document.getElementById("pen-thickness");
const eraserBtn = document.getElementById("eraser-btn");
const eraserThicknessInp = document.getElementById("eraser-thickness");
const toolSelect = document.getElementById("tool-select");
const brushSelect = document.getElementById("brush-type");

let eraserEnabledLocal = false;

// Change board color and persist
boardColorInp.addEventListener("change", (e) => {
  const color = e.target.value;
  canvas.style.backgroundColor = color;
  try { localStorage.setItem("boardColor", color); } catch (_) { console.error("Failed to persist board color:", _); }
});

// Change pen color
penColorInp.addEventListener("change", (e) => {
  const color = e.target.value;
  if (window.setPenColor) window.setPenColor(color);
});

// Change pen thickness
penThicknessInp.addEventListener("input", (e) => {
  const thickness = e.target.value;
  if (window.setPenThickness) window.setPenThickness(thickness);
});

// Toggle eraser mode with destination-out
eraserBtn.addEventListener("click", () => {
  eraserEnabledLocal = !eraserEnabledLocal;
  if (window.setEraserEnabled) window.setEraserEnabled(eraserEnabledLocal);
  eraserBtn.textContent = eraserEnabledLocal ? "Disable Eraser" : "Enable Eraser";
});

// Change eraser thickness
eraserThicknessInp.addEventListener("input", (e) => {
  const thickness = e.target.value;
  if (window.setEraserThickness) window.setEraserThickness(thickness);
});

// Tool selection
toolSelect.addEventListener("change", (e) => {
  const tool = e.target.value;
  if (window.setTool) window.setTool(tool);
});

// Brush selection
brushSelect.addEventListener("change", (e) => {
  const brush = e.target.value;
  if (window.setBrushType) window.setBrushType(brush);
});

