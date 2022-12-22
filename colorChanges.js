const canvas = document.getElementById("black-board");
const boardColorInp = document.getElementById("board-color");
const penColorInp = document.getElementById("pen-color");

boardColorInp.addEventListener("change", (e) => {
  const color = e.target.value;
  canvas.style.backgroundColor = color;
});

penColorInp.addEventListener("change", (e) => {
  const color = e.target.value;
  const context = canvas.getContext("2d");
  context.strokeStyle = color;
});
