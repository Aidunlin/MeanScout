// Offline
if ("serviceWorker" in navigator) {
  window.onload = () => {
    navigator.serviceWorker.register("./sw.js");
  }
}

const menuToggleButton = document.querySelector("#menu-toggle-btn");
const locationText = document.querySelector("#location-text");
const menuDiv = document.querySelector("#menu");
const locationSelect = document.querySelector("#location-select");
const templateCopyButton = document.querySelector("#template-copy-btn");
const templateEditButton = document.querySelector("#template-edit-btn");
const downloadSelect = document.querySelector("#download-type-sel");
const surveysDownloadButton = document.querySelector("#surveys-download-btn");
const surveysEraseButton = document.querySelector("#surveys-erase-btn");
const teamMetric = document.querySelector("#metric-team");
const teamMetricList = document.querySelector("#teams-list");
const matchMetric = document.querySelector("#metric-match");
const absentMetric = document.querySelector("#metric-absent");
const customMetricsDiv = document.querySelector("#metrics-custom");
const surveySaveButton = document.querySelector("#survey-save-btn");
const surveyResetButton = document.querySelector("#survey-reset-btn");

menuToggleButton.onclick = () => toggleMenu();
locationSelect.onchange = e => setLocation(e.target.value);
templateCopyButton.onclick = () => copyTemplate();
templateEditButton.onclick = () => editTemplate();
surveysDownloadButton.onclick = () => downloadSurveys();
surveysEraseButton.onclick = () => eraseSurveys();
teamMetric.oninput = () => backupSurvey();
matchMetric.oninput = () => backupSurvey();
absentMetric.onclick = () => toggleAbsent();
surveySaveButton.onclick = () => saveSurvey();
surveyResetButton.onclick = () => resetSurvey();

let scoutLocation = "Red Near";
let matchCount = 1;
let isAbsent = false;
let gameMetrics = [];

// If you make a new type, be sure to add it here
const metricTypes = {
  "toggle": ToggleMetric,
  "number": NumberMetric,
  "select": SelectMetric,
  "text": TextMetric,
  "rating": RatingMetric,
  "timer": TimerMetric,
};

// The example template showcases each metric type
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

let currentTemplate = JSON.parse(localStorage.template ?? JSON.stringify(exampleTemplate));
loadTemplate(currentTemplate);
setLocation(localStorage.location ?? "Red Near");

if (localStorage.backup) {
  const backup = JSON.parse(localStorage.backup);
  teamMetric.value = backup.find(metric => metric.name == "Team").value;
  matchCount = backup.find(metric => metric.name == "Match").value;
  matchMetric.value = matchCount;
  isAbsent = backup.find(metric => metric.name == "Absent").value;
  if (isAbsent) {
    absentMetric.innerHTML = "<i class='square-checked text-icon'></i>Absent";
    customMetricsDiv.classList.toggle("hide");
    refreshIcons(absentMetric);
  }
  gameMetrics.forEach(metric => {
    metric.update(backup.find(m => m.name == metric.name).value);
  });
}

/** Stores the current unsaved survey to `localStorage` */
function backupSurvey() {
  localStorage.backup = JSON.stringify([
    { name: "Team", value: teamMetric.value },
    { name: "Match", value: matchMetric.value },
    { name: "Absent", value: isAbsent },
    ...gameMetrics.map(metric => { return { name: metric.name, value: metric.value } })
  ]);
}

/** Toggles the options menu */
function toggleMenu() {
  menuDiv.classList.toggle("hide");
}

/** Toggles whether the team is absent */
function toggleAbsent() {
  customMetricsDiv.classList.toggle("hide");
  absentMetric.innerHTML = `<i class="square-${isAbsent ? "empty" : "checked"} text-icon"></i>Absent`;
  refreshIcons(absentMetric);
  isAbsent = !isAbsent;
  backupSurvey();
}

/** Copies the current template to clipboard */
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

/** Requests a new template and checks if the template is valid */
function editTemplate() {
  const newPrompt = prompt("Paste new template (you can also 'reset' the template):");
  if (newPrompt) {
    if (newPrompt == "reset") {
      setTemplate();
    } else {
      const newTemplate = JSON.parse(newPrompt);
      let error;
      if (newTemplate.metrics) {
        newTemplate.metrics.forEach(metric => {
          if (!metric.name) {
            error = "Metric has no name";
          }
          if (!Array.isArray(metric.values ?? [])) {
            error = "Metric has invalid values";
          }
          if (!metricTypes.hasOwnProperty(metric.type)) {
            error = "Metric has invalid type";
          }
        });
      } else {
        error = "Template has no metrics";
      }
      if (error) {
        alert(`Could not set template! ${error}`);
        return;
      }
      setTemplate(newTemplate);
    }
  }
}

/**
 * Sets a new template or to example template
 * @param {object} newTemplate An object that contains template data
 */
function setTemplate(newTemplate = exampleTemplate) {
  currentTemplate = JSON.parse(JSON.stringify(newTemplate));
  localStorage.template = JSON.stringify(currentTemplate ?? "");
  loadTemplate(currentTemplate);
  backupSurvey();
  refreshIcons();
}

/**
 * Loads a template into the UI
 * @param {object} newTemplate An object that contains template data
 */
function loadTemplate(newTemplate = exampleTemplate) {
  teamMetricList.innerHTML = "";
  if (newTemplate.teams) {
    newTemplate.teams.forEach(team => {
      teamMetricList.innerHTML += `<option value="${team}">`;
    });
  }
  customMetricsDiv.innerHTML = "";
  gameMetrics = [];
  let metricObject;
  newTemplate.metrics.forEach(metric => {
    metricObject = new metricTypes[metric.type](metric);
    if (metric.group) {
      let groupSpan = document.createElement("span");
      groupSpan.classList.add("group");
      groupSpan.innerHTML = metric.group;
      customMetricsDiv.append(groupSpan);
    }
    customMetricsDiv.append(metricObject.element);
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
  localStorage.location = newLocation;
  locationText.innerHTML = newLocation;
  locationSelect.value = newLocation;
  refreshIcons();
}

/** Validates and saves the current survey to `localStorage` */
function saveSurvey() {
  // Matches a 1-4 long sequence of numbers and an optional character
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
  // Matches a 1-3 long sequence of numbers
  if (!/\d{1,3}/.test(matchMetric.value)) {
    alert("Invalid match value");
    matchMetric.focus();
    return;
  }
  if (!confirm("Confirm save?")) {
    return;
  }
  let surveys = JSON.parse(localStorage.surveys ?? "[]");
  surveys.push([
    { name: "Team", value: teamMetric.value },
    { name: "Match", value: matchMetric.value },
    { name: "Absent", value: isAbsent },
    ...gameMetrics.map(metric => { return { name: metric.name, value: metric.value } })
  ]);
  localStorage.surveys = JSON.stringify(surveys);
  resetSurvey(false);
}

/**
 * Resets the current survey
 * @param {boolean} askUser A boolean that represents whether to prompt the user
 */
function resetSurvey(askUser = true) {
  if (askUser) {
    if (prompt("Type 'reset' to reset the survey") != "reset") {
      return;
    }
  }
  teamMetric.value = "";
  teamMetric.focus();
  if (!askUser) {
    matchCount = parseInt(matchMetric.value) + 1;
    matchMetric.value = matchCount;
  }
  if (isAbsent) {
    toggleAbsent();
  }
  gameMetrics.forEach(metric => metric.reset());
  refreshIcons();
  localStorage.backup = "";
}

/**
 * Downloads all surveys from `localStorage` either as CSV or JSON
 * @param {boolean} askUser A boolean that represents whether to prompt the user
 */
function downloadSurveys(askUser = true) {
  if (askUser) {
    if (!confirm("Confirm download?")) {
      return;
    }
  }
  const anchor = document.createElement("a");
  anchor.href = "data:text/plain;charset=utf-8,";
  if (downloadSelect.value == "CSV") {
    let surveys = JSON.parse(localStorage.surveys);
    let csv = "";
    if (surveys) {
      surveys.forEach(survey => {
        let surveyAsCSV = "";
        survey.forEach(metric => {
          if (typeof metric.value == "string") {
            surveyAsCSV += "\"" + metric.value + "\",";
          } else {
            surveyAsCSV += metric.value + ",";
          }
        });
        csv += surveyAsCSV + "\n";
      });
    }
    anchor.href += encodeURIComponent(csv);
    anchor.download = "surveys.csv";
  } else if (downloadSelect.value == "JSON") {
    anchor.href += encodeURIComponent(localStorage.surveys);
    anchor.download = "surveys.json";
  } 
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}

/** Erases all surveys from `localStorage` after prompting the user */
function eraseSurveys() {
  if (prompt("Type 'erase' to erase saved surveys") == "erase") {
    localStorage.surveys = "[]";
  }
}