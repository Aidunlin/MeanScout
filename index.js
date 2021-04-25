// Setup code

window.onbeforeunload = () => {
  if (/aidunlin\.com/.test(window.location.hostname)) {
    return true;
  }
};

if ("serviceWorker" in navigator) {
  window.onload = () => {
    navigator.serviceWorker.register("./sw.js");
  };
}

const icons = {
  "bars": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'><path fill='currentColor' d='M16 132h416c8.837 0 16-7.163 16-16V76c0-8.837-7.163-16-16-16H16C7.163 60 0 67.163 0 76v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16zm0 160h416c8.837 0 16-7.163 16-16v-40c0-8.837-7.163-16-16-16H16c-8.837 0-16 7.163-16 16v40c0 8.837 7.163 16 16 16z'></path></svg>",
  "copy": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'><path fill='currentColor' d='M320 448v40c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24V120c0-13.255 10.745-24 24-24h72v296c0 30.879 25.121 56 56 56h168zm0-344V0H152c-13.255 0-24 10.745-24 24v368c0 13.255 10.745 24 24 24h272c13.255 0 24-10.745 24-24V128H344c-13.2 0-24-10.8-24-24zm120.971-31.029L375.029 7.029A24 24 0 0 0 358.059 0H352v96h96v-6.059a24 24 0 0 0-7.029-16.97z'></path></svg>",
  "download": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><path fill='currentColor' d='M216 0h80c13.3 0 24 10.7 24 24v168h87.7c17.8 0 26.7 21.5 14.1 34.1L269.7 378.3c-7.5 7.5-19.8 7.5-27.3 0L90.1 226.1c-12.6-12.6-3.7-34.1 14.1-34.1H192V24c0-13.3 10.7-24 24-24zm296 376v112c0 13.3-10.7 24-24 24H24c-13.3 0-24-10.7-24-24V376c0-13.3 10.7-24 24-24h146.7l49 49c20.1 20.1 52.5 20.1 72.6 0l49-49H488c13.3 0 24 10.7 24 24zm-124 88c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20zm64 0c0-11-9-20-20-20s-20 9-20 20 9 20 20 20 20-9 20-20z'></path></svg>",
  "pen": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><path fill='currentColor' d='M290.74 93.24l128.02 128.02-277.99 277.99-114.14 12.6C11.35 513.54-1.56 500.62.14 485.34l12.7-114.22 277.9-277.88zm207.2-19.06l-60.11-60.11c-18.75-18.75-49.16-18.75-67.91 0l-56.55 56.55 128.02 128.02 56.55-56.55c18.75-18.76 18.75-49.16 0-67.91z'></path></svg>",
  "question": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 384 512'><path fill='currentColor' d='M202.021 0C122.202 0 70.503 32.703 29.914 91.026c-7.363 10.58-5.093 25.086 5.178 32.874l43.138 32.709c10.373 7.865 25.132 6.026 33.253-4.148 25.049-31.381 43.63-49.449 82.757-49.449 30.764 0 68.816 19.799 68.816 49.631 0 22.552-18.617 34.134-48.993 51.164-35.423 19.86-82.299 44.576-82.299 106.405V320c0 13.255 10.745 24 24 24h72.471c13.255 0 24-10.745 24-24v-5.773c0-42.86 125.268-44.645 125.268-160.627C377.504 66.256 286.902 0 202.021 0zM192 373.459c-38.196 0-69.271 31.075-69.271 69.271 0 38.195 31.075 69.27 69.271 69.27s69.271-31.075 69.271-69.271-31.075-69.27-69.271-69.27z'></path></svg>",
  "save": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'><path fill='currentColor' d='M433.941 129.941l-83.882-83.882A48 48 0 0 0 316.118 32H48C21.49 32 0 53.49 0 80v352c0 26.51 21.49 48 48 48h352c26.51 0 48-21.49 48-48V163.882a48 48 0 0 0-14.059-33.941zM224 416c-35.346 0-64-28.654-64-64 0-35.346 28.654-64 64-64s64 28.654 64 64c0 35.346-28.654 64-64 64zm96-304.52V212c0 6.627-5.373 12-12 12H76c-6.627 0-12-5.373-12-12V108c0-6.627 5.373-12 12-12h228.52c3.183 0 6.235 1.264 8.485 3.515l3.48 3.48A11.996 11.996 0 0 1 320 111.48z'></path></svg>",
  "square-empty": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'><path fill='currentColor' d='M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48zm-6 400H54c-3.3 0-6-2.7-6-6V86c0-3.3 2.7-6 6-6h340c3.3 0 6 2.7 6 6v340c0 3.3-2.7 6-6 6z'></path></svg>",
  "square-checked": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 448 512'><path fill='currentColor' d='M400 480H48c-26.51 0-48-21.49-48-48V80c0-26.51 21.49-48 48-48h352c26.51 0 48 21.49 48 48v352c0 26.51-21.49 48-48 48zm-204.686-98.059l184-184c6.248-6.248 6.248-16.379 0-22.627l-22.627-22.627c-6.248-6.248-16.379-6.249-22.628 0L184 302.745l-70.059-70.059c-6.248-6.248-16.379-6.248-22.628 0l-22.627 22.627c-6.248 6.248-6.248 16.379 0 22.627l104 104c6.249 6.25 16.379 6.25 22.628.001z'></path></svg>",
  "star-empty": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512'><path fill='currentColor' d='M528.1 171.5L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6zM388.6 312.3l23.7 138.4L288 385.4l-124.3 65.3 23.7-138.4-100.6-98 139-20.2 62.2-126 62.2 126 139 20.2-100.6 98z'></path></svg>",
  "star-filled": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 576 512'><path fill='currentColor' d='M259.3 17.8L194 150.2 47.9 171.5c-26.2 3.8-36.7 36.1-17.7 54.6l105.7 103-25 145.5c-4.5 26.3 23.2 46 46.4 33.7L288 439.6l130.7 68.7c23.2 12.2 50.9-7.4 46.4-33.7l-25-145.5 105.7-103c19-18.5 8.5-50.8-17.7-54.6L382 150.2 316.7 17.8c-11.7-23.6-45.6-23.9-57.4 0z'></path></svg>",
  "undo": "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><path fill='currentColor' d='M212.333 224.333H12c-6.627 0-12-5.373-12-12V12C0 5.373 5.373 0 12 0h48c6.627 0 12 5.373 12 12v78.112C117.773 39.279 184.26 7.47 258.175 8.007c136.906.994 246.448 111.623 246.157 248.532C504.041 393.258 393.12 504 256.333 504c-64.089 0-122.496-24.313-166.51-64.215-5.099-4.622-5.334-12.554-.467-17.42l33.967-33.967c4.474-4.474 11.662-4.717 16.401-.525C170.76 415.336 211.58 432 256.333 432c97.268 0 176-78.716 176-176 0-97.267-78.716-176-176-176-58.496 0-110.28 28.476-142.274 72.333h98.274c6.627 0 12 5.373 12 12v48c0 6.627-5.373 12-12 12z'></path></svg>"
};

let metricsDiv = document.querySelector("#metrics");
let teamMetric = document.querySelector("#metric-team");
let teamsList = document.querySelector("#teams");
let matchMetric = document.querySelector("#metric-match");
let absentMetric = document.querySelector("#metric-absent");

let theme = "red";
let scoutLocation = "Red Near";
let matchCount = 1;
let isAbsent = false;
let gameMetrics = [];
let exampleTemplate = {
  metrics: [
    { name: "Toggle", type: "toggle", group: "Group" },
    { name: "Number", type: "number", max: 10 },
    { name: "Select", type: "select", values: ["Value 1", "Value 2", "Value 3"] },
    { name: "Text", type: "text", tip: "Tip" },
    { name: "Rating", type: "rating" }
  ]
};
let currentTemplate = JSON.parse(localStorage.getItem("template") ?? JSON.stringify(exampleTemplate));
loadTemplate(currentTemplate);
setLocation(localStorage.getItem("location") ?? "Red Near");

// Template button functions

function copyTemplate() {
  let input = document.createElement("input");
  input.value = JSON.stringify(currentTemplate);
  document.body.append(input);
  input.select();
  input.setSelectionRange(0, 99999);
  document.execCommand("copy");
  input.remove();
  alert("Copied template");
}

function editTemplate() {
  let newPrompt = prompt("Paste new template (leave blank to cancel):");
  if (newPrompt) {
    let newTemplate = JSON.parse(newPrompt);
    let error = false;
    if (newTemplate.metrics) {
      newTemplate.metrics.forEach((metric, i) => {
        if (!metric.name
          || ((metric.max ?? 1) < 1)
          || !Array.isArray(metric.values ?? [])
          || !/toggle|number|select|text|rating/.test(metric.type)) {
          error = "Metric is invalid";
        }
      });
    } else {
      error = "Template is invalid";
    }
    if (error) {
      alert(`Could not set template! ${error}`);
      return;
    }
    setTemplate(newTemplate);
  }
}

function setTemplate(newTemplate = undefined) {
  if (!newTemplate) {
    if (!confirm("Confirm reset?")) {
      return;
    }
  }
  if (newTemplate) {
    currentTemplate = JSON.parse(JSON.stringify(newTemplate));
    localStorage.setItem("template", JSON.stringify(currentTemplate));
  } else {
    currentTemplate = JSON.parse(JSON.stringify(exampleTemplate));
    localStorage.removeItem("template");
  }
  if (localStorage.getItem("surveys")) {
    downloadSurveys(false);
  }
  loadTemplate(currentTemplate);
  setLocation(scoutLocation);
}

// Template code

function loadTemplate(newTemplate) {
  teamsList.innerHTML = "";
  newTemplate.teams?.forEach(team => {
    let newOption = document.createElement("option");
    newOption.value = team;
    teamsList.append(newOption);
  });
  metricsDiv.innerHTML = "";
  metricsDiv.style.marginLeft = "0";
  gameMetrics = [];
  let metricObject, newMetric;
  let currentDiv = document.createElement("div");
  currentDiv.classList.add("flex", "spaced", "bordered");
  newTemplate.metrics.forEach((metric, i) => {
    metricObject = {
      name: metric.name,
      type: metric.type
    };
    newMetric = document.createElement("div");
    switch (metric.type) {
      case "toggle":
        let button = document.createElement("button");
        button.innerHTML = "<i class='square-empty'></i> " + metric.name;
        button.onclick = () => change(i, metric.type);
        newMetric.append(button);
        metricObject.value = false;
        break;
      case "number":
        newMetric.innerHTML = metric.name + "<br>";
        let incButton = document.createElement("button");
        incButton.classList.add("inc");
        incButton.innerHTML = "00";
        incButton.onclick = () => change(i, metric.type, 1);
        newMetric.append(incButton);
        let decButton = document.createElement("button");
        decButton.classList.add("dec");
        decButton.innerHTML = "−";
        decButton.onclick = () => change(i, metric.type, -1);
        newMetric.append(decButton);
        metricObject.value = 0;
        metricObject.max = 99;
        if (metric.max) {
          metricObject.max = Math.min(metric.max, 99);
        }
        break;
      case "select":
        newMetric.innerHTML = metric.name;
        let select = document.createElement("select");
        select.onchange = () => change(i, metric.type);
        for (let value of metric.values) {
          let option = document.createElement("option");
          option.value = value;
          option.innerHTML = value;
          select.append(option);
        }
        newMetric.append(select);
        metricObject.value = metric.values[0];
        break;
      case "text":
        newMetric.innerHTML = metric.name;
        if (metric.length == "long") {
          newMetric.style.width = "100%";
        }
        let input = document.createElement("input");
        input.placeholder = metric.tip ?? "";
        input.oninput = () => change(i, metric.type);
        newMetric.append(input);
        metricObject.value = "";
        break;
      case "rating":
        newMetric.innerHTML = metric.name;
        let ratingBar = document.createElement("div");
        ratingBar.classList.add("flex");
        for (let j = 0; j < 5; j++) {
          let star = document.createElement("button");
          star.classList.add("star");
          star.innerHTML = "<i class='star-empty'></i>";
          star.onclick = () => change(i, metric.type, j);
          ratingBar.append(star);
        }
        newMetric.append(ratingBar);
        metricObject.value = 0;
    }
    if (metric.group) {
      if (i > 0) {
        metricsDiv.append(currentDiv);
      }
      if (typeof metric.group == "string") {
        metricsDiv.innerHTML += "<span class='group'>" + metric.group + "</span>";
      }
      currentDiv = document.createElement("div");
      currentDiv.classList.add("flex", "spaced", "bordered");
      metricsDiv.style.marginLeft = "8px";
    }
    currentDiv.append(newMetric);
    metricObject.element = newMetric;
    gameMetrics.push(metricObject);
  });
  metricsDiv.append(currentDiv);
}

function change(i, type, data = 0) {
  switch (type) {
    case "toggle":
      let button = gameMetrics[i].element.querySelector("button");
      button.innerHTML = "";
      let newIcon = document.createElement("i");
      newIcon.classList.add(`square-${gameMetrics[i].value ? "empty" : "checked"}`);
      button.append(newIcon);
      button.innerHTML += ` ${gameMetrics[i].name}`;
      gameMetrics[i].value = !gameMetrics[i].value;
      break;
    case "number":
      gameMetrics[i].value = Math.max(gameMetrics[i].value + data, 0);
      gameMetrics[i].value = Math.min(gameMetrics[i].value, gameMetrics[i].max);
      let inc = gameMetrics[i].element.querySelector(".inc");
      inc.innerHTML = (`0${gameMetrics[i].value}`).slice(-2);
      break;
    case "select":
      let select = gameMetrics[i].element.querySelector("select");
      gameMetrics[i].value = select.value;
      break;
    case "text":
      let text = gameMetrics[i].element.querySelector("input");
      gameMetrics[i].value = `"${text.value.replace('"', "'")}"`;
      break;
    case "rating":
      let stars = gameMetrics[i].element.querySelectorAll(".star");
      [...stars].forEach(star => star.innerHTML = "<i class='star-empty'></i>");
      if (data == 0 && gameMetrics[i].value == 1) {
        gameMetrics[i].value = 0;
      } else {
        for (let j = 0; j < data + 1; j++) {
          stars[j].innerHTML = "<i class='star-filled'></i>";
        }
        gameMetrics[i].value = data + 1;
      }
  }
  setLocation(scoutLocation);
}

// Location/theme setter

function setLocation(newLocation) {
  let newTheme = "red";
  if (/blue/.test(newLocation.toLowerCase())) {
    newTheme = "blue";
  }
  document.documentElement.style.setProperty("--theme-color", "var(--" + newTheme + ")");
  localStorage.setItem("location", newLocation);
  document.querySelector("#nav-location").innerHTML = newLocation;
  theme = newTheme;
  scoutLocation = newLocation;
  document.querySelector("#menu-location").value = scoutLocation;
  [...document.querySelectorAll("i")].forEach(icon => {
    icon.innerHTML = icons.question;
    for (const i in icons) {
      if (icon.classList.contains(i)) {
        icon.innerHTML = icons[i];
      }
    }
  });
}

// Team/match input checkers

function checkTeam() {
  teamMetric.value = teamMetric.value.substring(0, 5).toUpperCase();
  if (!/\w|\d/.test(teamMetric.value[teamMetric.value.length - 1])
    || /[A-Z]/.test(teamMetric.value[teamMetric.value.length - 2])
    || (/\d/.test(teamMetric.value[4]))) {
    teamMetric.value = teamMetric.value.substring(0, teamMetric.value.length - 1);
  }
}

function checkMatch() {
  matchMetric.value = matchMetric.value.substring(0, 3);
}

// Button toggles

function toggleMenu() {
  document.querySelector("#menu").classList.toggle("show");
}

function toggleAbsent() {
  metricsDiv.classList.toggle("hide");
  absentMetric.innerHTML = "";
  let newIcon = document.createElement("i");
  if (isAbsent) {
    newIcon.classList.add("square-empty");
    newIcon.innerHTML = icons["square-empty"];
  } else {
    newIcon.classList.add("square-checked");
    newIcon.innerHTML = icons["square-checked"];
  }
  absentMetric.append(newIcon);
  absentMetric.innerHTML += " Absent";
  isAbsent = !isAbsent;
}

// Survey functions

function saveSurvey() {
  if (!/\d{1,4}[A-Z]?/.test(teamMetric.value)) {
    alert("Please enter a proper team value!");
    teamMetric.focus();
    return;
  }
  if (currentTemplate.teams) {
    if (!currentTemplate.teams.some((t) => t == teamMetric.value)) {
      alert("Unaccepted team value!");
      teamMetric.focus();
      return;
    }
  }
  if (!/\d{1,3}/.test(matchMetric.value)) {
    alert("Please enter a proper match value!");
    matchMetric.focus();
    return;
  }
  if (!confirm("Confirm save?")) {
    return;
  }
  let survey = [
    { name: "Team", value: teamMetric.value },
    { name: "Match", value: matchMetric.value },
    { name: "Absent", value: isAbsent },
  ];
  gameMetrics.forEach(metric => survey.push({ name: metric.name, value: metric.value }));
  let surveys = JSON.parse(localStorage.getItem("surveys") ?? "[]");
  surveys.push(survey);
  localStorage.setItem("surveys", JSON.stringify(surveys));
  teamMetric.value = "";
  teamMetric.focus();
  matchCount = Math.min(parseInt(matchMetric.value) + 1, 999);
  matchMetric.value = matchCount;
  if (isAbsent) {
    toggleAbsent();
  }
  for (let i = 0; i < gameMetrics.length; i++) {
    switch (gameMetrics[i].type) {
      case "toggle":
        gameMetrics[i].value = false;
        let button = gameMetrics[i].element.querySelector("button")
        button.innerHTML = "";
        let newIcon = document.createElement("i");
        newIcon.classList.add("square-empty");
        button.append(newIcon);
        button.innerHTML += " " + gameMetrics[i].name;
        break;
      case "text":
        gameMetrics[i].value = "";
        gameMetrics[i].element.querySelector("input").value = "";
        break;
      case "number":
        gameMetrics[i].value = 0;
        gameMetrics[i].element.querySelector(".inc").innerHTML = "00";
        break;
      case "select":
        gameMetrics[i].value = gameMetrics[i].element.querySelector("option").value;
        gameMetrics[i].element.querySelector("select").value = gameMetrics[i].value;
        break;
      case "rating":
        gameMetrics[i].value = 0;
        let stars = gameMetrics[i].element.querySelectorAll(".star");
        [...stars].forEach(star => star.innerHTML = "<i class='star-empty'></i>");
    }
  }
  setLocation(scoutLocation);
}

function downloadSurveys(askUser = true) {
  if (askUser) {
    if (!confirm("Confirm download?")) {
      return;
    }
  }
  let a = document.createElement("a");
  a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(localStorage.getItem("surveys"));
  a.download = "surveys.json";
  document.body.append(a);
  a.click();
  document.body.removeChild(a);
  localStorage.removeItem("surveys");
}