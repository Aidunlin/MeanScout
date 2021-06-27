if ("serviceWorker" in navigator) {
  window.onload = () => navigator.serviceWorker.register("./sw.js");
}

const downloadTypeSelect = document.querySelector("#download-type");
const customMetrics = document.querySelector("#metrics-custom");

const menuToggle = document.querySelector("#menu-toggle");
const teamMetric = document.querySelector("#metric-team");
const teamsList = document.querySelector("#teams");
const matchMetric = document.querySelector("#metric-match");
const absentMetric = document.querySelector("#metric-absent");

menuToggle.onclick = () => toggleMenu();
teamMetric.oninput = () => backupCurrentSurvey();
matchMetric.oninput = () => backupCurrentSurvey();
absentMetric.onclick = () => toggleAbsent();

if (window.location.href.includes("localhost")) menuToggle.click();

let scoutLocation = "Red Near";
let matchCount = 1;
let isAbsent = false;
let gameMetrics = [];
const metricTypes = {
  "toggle": ToggleMetric,
  "number": NumberMetric,
  "select": SelectMetric,
  "text": TextMetric,
  "rating": RatingMetric,
  "timer": TimerMetric,
};

const exampleTemplate = {
  metrics: [
    { name: "Toggle", type: "toggle", group: "Group" },
    { name: "Number", type: "number" },
    { name: "Select", type: "select", values: ["Value 1", "Value 2", "Value 3"] },
    { name: "Text", type: "text", tip: "Tip" },
    { name: "Rating", type: "rating" },
    { name: "Timer", type: "timer" },
  ]
};
let currentTemplate = JSON.parse(localStorage.getItem("template") ?? JSON.stringify(exampleTemplate));

loadTemplate(currentTemplate);
setLocation(localStorage.getItem("location") ?? "Red Near");

if (localStorage.getItem("backup")) {
  const backupSurvey = JSON.parse(localStorage.getItem("backup"));
  teamMetric.value = backupSurvey.find(metric => metric.name == "Team").value;
  matchCount = backupSurvey.find(metric => metric.name == "Match").value;
  matchMetric.value = matchCount;
  isAbsent = backupSurvey.find(metric => metric.name == "Absent").value;
  if (isAbsent) {
    absentMetric.innerHTML = "<i class='square-checked'></i> Absent";
    customMetrics.classList.toggle("hide");
    refreshIcons(absentMetric);
  }
  gameMetrics.forEach(metric => {
    metric.update(backupSurvey.find(m => m.name == metric.name).value);
  });
}

/**
 * Stores the current unsaved survey to `localStorage`
 */
function backupCurrentSurvey() {
  localStorage.setItem("backup", JSON.stringify([
    { name: "Team", value: teamMetric.value },
    { name: "Match", value: matchMetric.value },
    { name: "Absent", value: isAbsent },
    ...gameMetrics.map(metric => { return { name: metric.name, value: metric.value } })
  ]));
}

/**
 * Toggles the options menu
 */
function toggleMenu() {
  document.querySelector("#menu").classList.toggle("hide");
}

/**
 * Toggles whether the team is absent
 */
function toggleAbsent() {
  customMetrics.classList.toggle("hide");
  absentMetric.innerHTML = `<i class="square-${isAbsent ? "empty" : "checked"}"></i> Absent`;
  refreshIcons(absentMetric);
  isAbsent = !isAbsent;
  backupCurrentSurvey();
}

/**
 * Copies the current template to clipboard
 */
function copyTemplate() {
  const input = document.createElement("input");
  input.value = JSON.stringify(currentTemplate);
  document.body.append(input);
  input.select();
  input.setSelectionRange(0, input.value.length);
  document.execCommand("copy");
  input.remove();
  alert("Copied template");
}

/**
 * Requests a new template and checks if the template is valid
 */
function editTemplate() {
  const newPrompt = prompt("Paste new template (leave blank to cancel):");
  if (newPrompt) {
    const newTemplate = JSON.parse(newPrompt);
    let error;
    if (newTemplate.metrics) {
      newTemplate.metrics.forEach(metric => {
        if (!metric.name) error = "Metric has no name";
        if (!Array.isArray(metric.values ?? [])) error = "Metric has invalid values";
        if (!metricTypes.hasOwnProperty(metric.type)) error = "Metric has invalid type";
      });
    } else error = "Template has no metrics";
    if (error) {
      alert(`Could not set template! ${error}`);
      return;
    }
    setTemplate(newTemplate, false);
  }
}

/**
 * Sets a new template or to example template
 * @param {object} newTemplate An object that contains template data
 */
function setTemplate(newTemplate = exampleTemplate, askUser = true) {
  if (askUser) if (prompt("Type 'reset' to reset the template") != "reset") return;
  currentTemplate = JSON.parse(JSON.stringify(newTemplate));
  localStorage.setItem("template", JSON.stringify(currentTemplate ?? ""));
  loadTemplate(currentTemplate);
  backupCurrentSurvey();
  refreshIcons();
}

/**
 * Loads a template into the UI
 * @param {object} newTemplate An object that contains template data
 */
function loadTemplate(newTemplate = exampleTemplate) {
  teamsList.innerHTML = "";
  if (newTemplate.teams) {
    newTemplate.teams.forEach(team => {
      teamsList.innerHTML += `<option value="${team}">`;
    });
  }
  customMetrics.innerHTML = "";
  gameMetrics = [];
  let metricObject;
  newTemplate.metrics.forEach(metric => {
    metricObject = new metricTypes[metric.type](metric);
    if (metric.group) {
      let groupSpan = document.createElement("span");
      groupSpan.classList.add("group");
      groupSpan.innerHTML = metric.group;
      customMetrics.append(groupSpan);
    }
    customMetrics.append(metricObject.element);
    gameMetrics.push(metricObject);
  });
}

/**
 * Sets a new scout location
 * @param {string} newLocation A string that includes alliance color and robot position
 */
function setLocation(newLocation = "Red Near") {
  scoutLocation = newLocation;
  let newTheme = "red";
  if (/blue/.test(newLocation.toLowerCase())) newTheme = "blue";
  document.documentElement.style.setProperty("--theme-color", `var(--${newTheme})`);
  localStorage.setItem("location", newLocation);
  document.querySelector("#location-text").innerHTML = newLocation;
  document.querySelector("#location-select").value = newLocation;
  refreshIcons();
}

/**
 * Validates and saves the current survey to `localStorage`
 */
function saveSurvey() {
  if (!/^\d{1,4}[A-Z]?$/.test(teamMetric.value)) {
    alert("Invalid team value");
    teamMetric.focus();
    return;
  }
  if (currentTemplate.teams) {
    if (!currentTemplate.teams.some(team => team == teamMetric.value)) {
      alert("Invalid team value");
      teamMetric.focus();
      return;
    }
  }
  if (!/\d{1,3}/.test(matchMetric.value)) {
    alert("Invalid match value");
    matchMetric.focus();
    return;
  }
  if (!confirm("Confirm save?")) return;
  let surveys = JSON.parse(localStorage.getItem("surveys") ?? "[]");
  surveys.push([
    { name: "Team", value: teamMetric.value },
    { name: "Match", value: matchMetric.value },
    { name: "Absent", value: isAbsent },
    ...gameMetrics.map(metric => { return { name: metric.name, value: metric.value } })
  ]);
  localStorage.setItem("surveys", JSON.stringify(surveys));
  resetSurvey(false);
}

/**
 * Resets the current survey
 * @param {boolean} askUser A boolean that represents whether to prompt the user
 */
function resetSurvey(askUser = true) {
  if (askUser) if (prompt("Type 'reset' to reset the survey") != "reset") return;
  teamMetric.value = "";
  teamMetric.focus();
  if (!askUser) {
    matchCount = parseInt(matchMetric.value) + 1;
    matchMetric.value = matchCount;
  }
  if (isAbsent) toggleAbsent();
  gameMetrics.forEach(metric => metric.reset());
  refreshIcons();
  localStorage.removeItem("backup");
}

/**
 * Downloads all surveys from `localStorage` either as JSON or CSV
 * @param {boolean} askUser A boolean that represents whether to prompt the user
 */
function downloadSurveys(askUser = true) {
  if (askUser) if (!confirm("Confirm download?")) return;
  const anchor = document.createElement("a");
  anchor.href = "data:text/plain;charset=utf-8,";
  switch (downloadTypeSelect.value) {
    case "JSON":
      anchor.href += encodeURIComponent(localStorage.getItem("surveys"));
      anchor.download = "surveys.json";
      break;
    case "CSV":
      let surveys = JSON.parse(localStorage.getItem("surveys"));
      let csv = "";
      if (surveys) {
        surveys.forEach(survey => {
          let surveyAsCSV = "";
          survey.forEach(metric => {
            if (typeof metric.value == "string") surveyAsCSV += "\"" + metric.value + "\",";
            else surveyAsCSV += metric.value + ",";
          });
          csv += surveyAsCSV + "\n";
        });
      }
      anchor.href += encodeURIComponent(csv);
      anchor.download = "surveys.csv";
      break;
  }
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}

/**
 * Erases all surveys from `localStorage` after prompting the user
 */
function eraseSurveys() {
  if (prompt("Type 'erase' to erase saved surveys") == "erase") localStorage.removeItem("surveys");
}