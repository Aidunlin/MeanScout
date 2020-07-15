window.onbeforeunload = () => {
  if (/aidunlin\.codes/.test(window.location.hostname)) {
    return true;
  }
};

if ("serviceWorker" in navigator) {
  window.onload = () => {
    navigator.serviceWorker.register("./sw.js");
  };
}

let theme = "red";
let scoutLocation = "Red Near";
let matchCount = 1;
let isAbsent = false;
let gameMetrics = [];
let exampleTemplate = {
  metrics: [
    { name: "Toggle", type: "toggle", group: "Group" },
    { name: "Number", type: "number", max: 10 },
    { name: "Select", type: "select", values: [
      "Value 1", "Value 2", "Value 3" ]
    },
    { name: "Text", type: "text", tip: "Tip" },
    { name: "Rating", type: "rating" }
  ]
};
let currentTemplate = JSON.parse(JSON.stringify(exampleTemplate));
if (localStorage.getItem("template")) {
  currentTemplate = JSON.parse(localStorage.getItem("template"));
}
loadTemplate(currentTemplate);
if (localStorage.getItem("location")) {
  setLocation(localStorage.getItem("location"));
} else {
  setLocation("Red Near");
}

// Template button functions

function editTemplate() {
  let newPrompt = prompt("Paste new template (leave blank to cancel):");
  if (newPrompt) {
    let newTemplate = JSON.parse(newPrompt);
    if (Array.isArray(newTemplate)) {
      newTemplate = newTemplate[0];
    }
    let error = false;
    if (newTemplate.metrics) {
      newTemplate.metrics.forEach((metric, i) => {
        if (!metric.name) {
          error = `Metric ${i}: no name`;
        } else if (metric.type == "number" && metric.max < 1) {
          error = `Metric ${i}: max is less than one`;
        } else if (metric.type == "select" && !metric.values) {
          error = `Metric ${i}: no values`;
        } else if (!/toggle|number|select|text|rating/.test(metric.type)) {
          error = `Metric ${i}: unknown type`;
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

function copyTemplate() {
  let input = document.createElement("input");
  input.value = JSON.stringify(currentTemplate);
  document.getElementsByTagName("body")[0].appendChild(input);
  input.select();
  document.execCommand("copy");
  input.remove();
  alert("Copied template");
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
  document.getElementById("teams").innerHTML = "";
  if (newTemplate.teams) {
    newTemplate.teams.forEach(team => {
      let newOption = document.createElement("option");
      newOption.value = team;
      document.getElementById("teams").appendChild(newOption);
    });
  }
  document.getElementById("metrics").innerHTML = "";
  document.getElementById("metrics").classList.remove("margin-left");
  gameMetrics = [];
  let metricObject, newMetric;
  let currentDiv = document.createElement("div");
  currentDiv.classList.add("flex");
  newTemplate.metrics.forEach((metric, i) => {
    metricObject = {
      name: metric.name,
      type: metric.type
    };
    switch (metric.type) {
      case "toggle":
        newMetric = document.createElement("div");
        let button = document.createElement("button");
        button.innerHTML = `<i class="far fa-square"></i> ${metric.name}`;
        button.onclick = () => change(i, metric.type);
        newMetric.appendChild(button);
        metricObject.value = false;
        break;
      case "number":
        newMetric = document.createElement("div");
        newMetric.innerHTML = `${metric.name}<br>`;
        let incButton = document.createElement("button");
        incButton.classList.add("inc");
        incButton.innerHTML = "00";
        incButton.onclick = () => change(i, metric.type, 1);
        newMetric.appendChild(incButton);
        let decButton = document.createElement("button");
        decButton.classList.add("dec");
        decButton.innerHTML = "−";
        decButton.onclick = () => change(i, metric.type, -1);
        newMetric.appendChild(decButton);
        metricObject.value = 0;
        metricObject.max = metric.max ? Math.min(metric.max, 99) : 99;
        break;
      case "select":
        newMetric = document.createElement("label");
        newMetric.innerHTML = metric.name;
        let select = document.createElement("select");
        select.onchange = () => change(i, metric.type);
        for (let value of metric.values) {
          let option = document.createElement("option");
          option.value = value;
          option.innerHTML = value;
          select.appendChild(option);
        }
        newMetric.appendChild(select);
        metricObject.value = metric.values[0];
        break;
      case "text":
        newMetric = document.createElement("label");
        newMetric.innerHTML = metric.name;
        if (metric.length == "long") {
          newMetric.style.width = "100%";
        }
        let input = document.createElement("input");
        if (metric.tip) {
          input.placeholder = metric.tip;
        }
        input.oninput = () => change(i, metric.type);
        newMetric.appendChild(input);
        metricObject.value = "";
        break;
      case "rating":
        newMetric = document.createElement("div");
        newMetric.innerHTML = metric.name;
        let ratingBar = document.createElement("div");
        ratingBar.classList.add("flex");
        for (let j = 0; j < 5; j++) {
          let star = document.createElement("button");
          star.classList.add("star");
          star.innerHTML = "<i class='far fa-star'></i>";
          star.onclick = () => change(i, metric.type, j);
          ratingBar.appendChild(star);
        }
        newMetric.appendChild(ratingBar);
        metricObject.value = 0;
    }
    newMetric.classList.add("margin-bottomleft");
    if (metric.group) {
      if (i > 0) {
        document.getElementById("metrics").appendChild(currentDiv);
      }
      if (typeof metric.group == "string") {
        document.getElementById("metrics").innerHTML += metric.group;
        document.getElementById("metrics").classList.add("margin-left");
      }
      currentDiv = document.createElement("div");
      currentDiv.classList.add("flex");
    }
    currentDiv.appendChild(newMetric);
    metricObject.element = newMetric;
    gameMetrics.push(metricObject);
  });
  document.getElementById("metrics").appendChild(currentDiv);
}

function change(i, type, data = 0) {
  switch (type) {
    case "toggle":
      let button = gameMetrics[i].element.getElementsByTagName("button")[0];
      button.innerHTML = "";
      let newIcon = document.createElement("i");
      if (gameMetrics[i].value) {
        newIcon.classList.add("far", "fa-square");
      } else {
        newIcon.classList.add("fas", "fa-check");
      }
      button.appendChild(newIcon);
      button.innerHTML += " " + gameMetrics[i].name;
      gameMetrics[i].value = !gameMetrics[i].value;
      break;
    case "number":
      gameMetrics[i].value += data;
      gameMetrics[i].value = Math.max(gameMetrics[i].value, 0);
      gameMetrics[i].value = Math.min(gameMetrics[i].value, gameMetrics[i].max);
      let inc = gameMetrics[i].element.getElementsByClassName("inc")[0];
      inc.innerHTML = ("0" + gameMetrics[i].value).slice(-2);
      break;
    case "select":
      let select = gameMetrics[i].element.getElementsByTagName("select")[0];
      gameMetrics[i].value = select.value;
      break;
    case "text":
      let text = gameMetrics[i].element.getElementsByTagName("input")[0];
      gameMetrics[i].value = `"${text.value.replace('"', "'")}"`;
      break;
    case "rating":
      let stars = gameMetrics[i].element.getElementsByClassName("star");
      [...stars].forEach(star => star.innerHTML = "<i class='far fa-star'></i>");
      if (data == 0 && gameMetrics[i].value == 1) {
        gameMetrics[i].value = 0;
      } else {
        for (let j = 0; j < data + 1; j++) {
          stars[j].innerHTML = "<i class='fas fa-star'></i>";
        }
        gameMetrics[i].value = data + 1;
      }
  }
  setLocation(scoutLocation);
}

// Location/theme setter

function setLocation(newLocation) {
  let newTheme;
  if (/Blue/.test(newLocation)) {
    newTheme = "blue";
  } else {
    newTheme = "red";
  }
  ["title", "nav-location"].forEach(id => {
    document.getElementById(id).classList.remove(theme);
    document.getElementById(id).classList.add(newTheme);
  });
  ["input", "select", "i", "svg"].forEach(tag => {
    [...document.getElementsByTagName(tag)].forEach(element => {
      element.classList.remove(theme);
      element.classList.add(newTheme);
    });
  });
  ["inc", "star"].forEach(cls => {
    [...document.getElementsByClassName(cls)].forEach(element => {
      element.classList.remove(theme);
      element.classList.add(newTheme);
    });
  });
  localStorage.setItem("location", newLocation);
  document.getElementById("nav-location").innerHTML = newLocation;
  theme = newTheme;
  scoutLocation = newLocation;
  document.getElementById("menu-location").value = scoutLocation;
}

// Team/match input checkers

function checkTeam() {
  let team = document.getElementById("metric-team");
  team.value = team.value.toUpperCase();
  if (
    !/\w|\d/.test(team.value.charAt(team.value.length - 1))
    || /[A-Z]/.test(team.value.charAt(team.value.length - 2))
    || (team.value.length == 5 && /\d/.test(team.value.charAt(4)))
    ) {
    team.value = team.value.substring(0, team.value.length - 1);
  }
  team.value = team.value.substring(0, 5);
}

function checkMatch() {
  let match = document.getElementById("metric-match");
  match.value = match.value.substring(0, 3);
}

// Button toggles

function toggleMenu() {
  document.getElementById("menu").classList.toggle("show-flex");
}

function toggleAbsent() {
  document.getElementById("metrics").classList.toggle("hide");
  document.getElementById("metric-absent").innerHTML = "";
  let newIcon = document.createElement("i");
  newIcon.classList.add(theme);
  if (isAbsent) {
    newIcon.classList.add("far", "fa-square");
  } else {
    newIcon.classList.add("fas", "fa-check");
  }
  document.getElementById("metric-absent").appendChild(newIcon);
  document.getElementById("metric-absent").innerHTML += " Absent";
  isAbsent = !isAbsent;
}

// Survey functions

function saveSurvey() {
  let team = document.getElementById("metric-team");
  let match = document.getElementById("metric-match");
  if (!/\d{1,4}[A-Z]?/.test(team.value)) {
    alert("Please enter a proper team value!");
    team.focus();
    return;
  }
  if (currentTemplate.teams) {
    if (!currentTemplate.teams.some((t) => t == team.value)) {
      alert("Unaccepted team value!");
      team.focus();
      return;
    }
  }
  if (!/\d{1,3}/.test(match.value)) {
    alert("Please enter a proper match value!");
    match.focus();
    return;
  }
  if (!confirm("Confirm save?")) {
    return;
  }
  let values = `${team.value},${match.value},${isAbsent}`;
  gameMetrics.forEach(metric => values += `,${metric.value}`);
  let savedSurveys = localStorage.getItem("surveys");
  localStorage.setItem("surveys", `${savedSurveys || ""}${values}\n`);
  team.value = "";
  team.focus();
  matchCount = Math.min(parseInt(match.value) + 1, 999);
  match.value = matchCount;
  if (isAbsent) {
    toggleAbsent();
  }
  for (let i = 0; i < gameMetrics.length; i++) {
    switch (gameMetrics[i].type) {
      case "toggle":
        gameMetrics[i].value = false;
        let button = gameMetrics[i].element.getElementsByTagName("button")[0];
        button.innerHTML = "";
        let newIcon = document.createElement("i");
        newIcon.classList.add("far", "fa-square");
        button.appendChild(newIcon);
        button.innerHTML += " " + gameMetrics[i].name;
        gameMetrics[i].element.getElementsByTagName("i")[0].classList.add(theme);
        break;
      case "text":
        gameMetrics[i].value = "";
        gameMetrics[i].element.getElementsByTagName("input")[0].value = "";
        break;
      case "number":
        gameMetrics[i].value = 0;
        gameMetrics[i].element.getElementsByClassName("inc")[0].innerHTML = "00";
        break;
      case "select":
        gameMetrics[i].value = gameMetrics[i].element.getElementsByTagName("option")[0].value;
        gameMetrics[i].element.getElementsByTagName("select")[0].value = gameMetrics[i].value;
        break;
      case "rating":
        gameMetrics[i].value = 0;
        let stars = gameMetrics[i].element.getElementsByClassName("star");
        [...stars].forEach(star => star.innerHTML = "<i class='far fa-star'></i>");
    }
  }
}

function downloadSurveys(askUser = true) {
  if (askUser) {
    if (!confirm("Confirm download?")) {
      return;
    }
  }
  let a = document.createElement("a");
  a.href = "data:text/plain;charset=utf-8,";
  a.href += encodeURIComponent(localStorage.getItem("surveys"));
  a.download = "surveys.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  localStorage.removeItem("surveys");
}
