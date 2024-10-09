var drawArray = [];
var drawStep = -1;
let isPageReloaded =
  JSON.parse(localStorage.getItem("isPageReloaded")) || false;
var email = localStorage.getItem("email") || null;
var isSignedIn;
const buttonDownload = document.getElementById("download");
buttonDownload.addEventListener("click", function () {
  if (!isSignedIn) {
    alert("Please sign in to continue!");
  } else {
    downloadOptions();
  }
});

const shareBtnPress = document.getElementById("shareBtn");
shareBtnPress.addEventListener("click", () => {
  const currElemStatus = document.getElementById("allOptions").style.display;
  if (currElemStatus == "flex") {
    document.getElementById("allOptions").style.display = "none";
    document.getElementById("shareBtn").firstElementChild.src =
      "https://thenounproject.com/api/private/icons/2137557/edit/?backgroundShape=SQUARE&backgroundShapeColor=%23000000&backgroundShapeOpacity=0&exportSize=752&flipX=false&flipY=false&foregroundColor=%23000000&foregroundOpacity=1&imageFormat=png&rotation=0";
  } else {
    document.getElementById("allOptions").style.display = "flex";
    document.getElementById("shareBtn").firstElementChild.src =
      "https://thenounproject.com/api/private/icons/6161882/edit/?backgroundShape=SQUARE&backgroundShapeColor=%23000000&backgroundShapeOpacity=0&exportSize=752&flipX=false&flipY=false&foregroundColor=%23000000&foregroundOpacity=1&imageFormat=png&rotation=0";
  }
});

// eslint-disable-next-line no-unused-vars
function copyClipFun() {
  navigator.clipboard.writeText("https://board-dhanushnehru.netlify.app/");
}

const copyClipBoard = document.getElementById("copyCopy");
copyClipBoard.addEventListener("mouseenter", () => {
  document.getElementById("copyStatDiv").style.display = "block";
  document.getElementById("copyStatDiv").innerHTML = "Copy to clipboard";
});

copyClipBoard.addEventListener("mouseleave", () => {
  document.getElementById("copyStatDiv").style.display = "none";
});

copyClipBoard.addEventListener("click", () => {
  document.getElementById("copyStatDiv").innerHTML = "Copied successfully";
});

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
  // function startPosition(e) {
  //   painting = true;
  //   draw(e);
  // }

  function endPosition() {
    painting = false;
    ctx.beginPath();
    pushCanvas();
    saveCanvas(email);
  }

  function draw(e) {
    if (!painting) {
      return;
    }
    if (!isSignedIn) {
      alert("Please signin to continue!");
      painting = false;
    } else {
      console.log("gf");
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

      saveCanvas(email);
    }
  }

  function saveCanvas(email) {
    localStorage.setItem(`myCanvas_${email}`, canvas.toDataURL());
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

function pushCanvas(canvas) {
  drawStep++;
  if (drawStep === drawArray.length) {
    const tempArray = drawArray.slice(0, drawArray.length);
    tempArray.push(canvas.toDataURL());
    drawArray = tempArray;
  } else {
    drawArray[drawStep] = canvas.toDataURL();
  }
}
// Save the canvas data URL to localStorage
function saveCanvas(email, canvas) {
  localStorage.setItem(`myCanvas_${email}`, canvas.toDataURL());
}

// eslint-disable-next-line no-unused-vars
function onClear() {
  const canvas = document.getElementById("black-board");
  const context = canvas.getContext("2d");

  context.clearRect(0, 0, canvas.width, canvas.height);
  localStorage.setItem(`myCanvas_${email}`, null);
  pushCanvas(canvas);
  saveCanvas(email, canvas);
}

function loadCanvas(email) {
  if (localStorage.getItem(`myCanvas_${email}`) !== null) {
    const canvas = document.getElementById("black-board");
    const ctx = canvas.getContext("2d");

    const dataURL = localStorage.getItem(`myCanvas_${email}`);

    let img = new Image();

    img.src = dataURL;
    img.onload = function () {
      ctx.drawImage(img, 0, 0);
    };
  }
}

// eslint-disable-next-line no-unused-vars
function onUndo() {
  //function to undo the drawing
  if (drawStep >= 0) {
    // Check if there are previous drawings to undo

    const canvas = document.getElementById("black-board");
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
    drawStep--;
    var canvasPic = new Image();
    canvasPic.src = drawArray[drawStep];

    // Load the previous drawing from drawArray
    canvasPic.onload = function () {
      ctx.drawImage(canvasPic, 0, 0);
      console.log(email);
      localStorage.setItem(`myCanvas_${email}`, canvas.toDataURL());
    };
    if (isPageReloaded) {
      // If the browser tab was reloaded or re-opened
      var canvasPicOld = new Image();
      canvasPicOld.src = localStorage.getItem(`oldImage_${email}`);
      canvasPicOld.onload = function () {
        // Draw the previous image on the canvas
        ctx.drawImage(canvasPicOld, 0, 0);
      };
    } else {
      // Reset the drawArray and drawStep since there are no more previous drawings
      drawArray = [];
      drawStep = -1;
    }
  }
}

window.addEventListener("beforeunload", function () {
  const canvas = document.getElementById("black-board");
  localStorage.setItem("isPageReloaded", "true");
  localStorage.setItem(`oldImage_${email}`, canvas.toDataURL());
});

// Function to handle sign-in response
// eslint-disable-next-line no-unused-vars
function handleCredentialResponse(response) {
  if (response.credential) {
    const result = parseJwt(response.credential);
    email = result.email;
    isSignedIn = true;

    localStorage.setItem("isSignedIn", "true");
    localStorage.setItem("email", result.email);
    localStorage.setItem("name", result.given_name);
    loadCanvas(email);

    // Show the username
    const userNameElement = document.getElementById("g_id_user");
    userNameElement.textContent = `Hi, ${result.given_name}`;
    userNameElement.style.display = "block";
    userNameElement.style.color = "white";

    // Hide the sign-in button
    const signInButton = document.querySelector(".g_id_signin");
    signInButton.style.display = "none";

    // Show the sign-out button
    const signOutButton = document.getElementById("g_id_signout");
    signOutButton.style.display = "block";
  } else {
    // eslint-disable-next-line no-undef
    google.accounts.id.prompt();
  }
}

// Function to handle sign-out
// eslint-disable-next-line no-unused-vars
function signOut() {
  // Clear the username
  const userNameElement = document.getElementById("g_id_user");
  userNameElement.textContent = "";
  userNameElement.style.display = "none";
  email = null;
  isSignedIn = false;
  drawArray = [];
  drawStep = -1;

  localStorage.removeItem("isSignedIn");
  localStorage.removeItem("email");
  localStorage.removeItem("email");

  // Show the sign-in button
  const signInButton = document.querySelector(".g_id_signin");
  signInButton.style.display = "block";

  // Hide the sign-out button
  const signOutButton = document.getElementById("g_id_signout");
  signOutButton.style.display = "none";

  const canvas = document.getElementById("black-board");
  const context = canvas.getContext("2d");

  context.clearRect(0, 0, canvas.width, canvas.height);
}

function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );

  return JSON.parse(jsonPayload);
}

window.addEventListener("load", function () {
  // Check if the user is already signed in
  isSignedIn = localStorage.getItem("isSignedIn");
  const userName = localStorage.getItem("name");
  email = localStorage.getItem("email") || null;

  if (isSignedIn && userName) {
    // Show the username
    const userNameElement = document.getElementById("g_id_user");
    userNameElement.textContent = `Hi, ${userName}`;
    userNameElement.style.display = "block";
    userNameElement.style.color = "white";

    // Hide the sign-in button
    const signInButton = document.querySelector(".g_id_signin");
    signInButton.style.display = "none";

    // Show the sign-out button
    const signOutButton = document.getElementById("g_id_signout");
    signOutButton.style.display = "block";
  }
});

function loadConfig() {
  fetch("config.json")
    .then((response) => response.json())
    .then((config) => {
      var client_id = config.client_id;
      var element = document.getElementById("g_id_onload");
      console.log(element);
      element.setAttribute("data-client_id", client_id)
    })
    .catch((error) => console.error("Error loading configuration:", error));
}

loadCanvas(email);

blackBoard();

document.addEventListener("DOMContentLoaded", function () {
  loadConfig();
});
