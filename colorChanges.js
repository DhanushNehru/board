const canvas = document.getElementById("black-board");
const ctx = canvas.getContext("2d");
const boardColorInp = document.getElementById("board-color");
const penColorInp = document.getElementById("pen-color");


boardColorInp.addEventListener('change', (e)=>{
    const color = e.target.value;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
});


penColorInp.addEventListener('change', (e)=>{
    const color = e.target.value;
    const context = canvas.getContext("2d");
    context.strokeStyle = color;
});