// Check if user wants to reload/close
window.onbeforeunload = () => {
  if (/aidunlin\.codes/.test(window.location.hostname)) {
    return true;
  }
};

// Register service worker
if ("serviceWorker" in navigator) {
  window.onload = () => {
    navigator.serviceWorker.register("./sw.js");
  };
}

const unchecked = "far fa-square";
const checked = "fas fa-check-square";
const unstarred = "far fa-star";
const starred = "fas fa-star";

let gameMetrics = [];
let exampleTemplate = {
  metrics: [
    { name: "Toggle", type: "toggle", group: "Group" },
    { name: "Number", type: "number", max: 10 },
    { name: "Select", type: "select", values: ["Value 1", "Value 2", "Value 3"], },
    { name: "Text", type: "text", tip: "Tip" },
    { name: "Rating", type: "rating" },
  ],
};
let currentTemplate = JSON.parse(localStorage.getItem("template") || JSON.stringify(exampleTemplate));
loadTemplate(currentTemplate.metrics);
if (currentTemplate.teams) {
  for (let team of currentTemplate.teams) {
    $("#teams").append(`<option value="${team}">`);
  }
}

function copyTemplate() {
  let input = $("<input>");
  let templateToCopy = currentTemplate;
  $("body").append(input);
  input.attr("value", JSON.stringify(templateToCopy));
  input.select();
  document.execCommand("copy");
  $(input).remove();
  alert(`Copied template`);
}

function editTemplate() {
  let newPrompt = prompt("Paste new template (or leave blank to cancel or type 'default' to load default):");
  if (newPrompt) {
    let newTemplate = newPrompt == "default" ? exampleTemplate : JSON.parse(newPrompt);
    if (Array.isArray(newTemplate)) {
      newTemplate = newTemplate[0];
    }
    let error = false;
    if (newTemplate.metrics) {
      $.each(newTemplate.metrics, (i, metric) => {
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
      alert(`Could not add template! ${error}`);
      return;
    }
    currentTemplate = JSON.parse(JSON.stringify(newTemplate));
    localStorage.setItem("template", JSON.stringify(currentTemplate));
    if (localStorage.getItem("surveys")) {
      downloadSurveys(false);
    }
    loadTemplate(currentTemplate.metrics);
    setLocation(scoutLocation);
    $("#teams").empty();
    if (currentTemplate.teams) {
      for (let team of currentTemplate.teams) {
        $("#teams").append(`<option value="${team}">`);
      }
    }
  }
}

// Handles metric UI/value changes
function change(i, type, data = 0) {
  switch (type) {
    case "toggle":
      gameMetrics[i].element.find("button").html(`<i class="${gameMetrics[i].value ? unchecked : checked}"></i> ${gameMetrics[i].name}`);
      gameMetrics[i].value = !gameMetrics[i].value;
      break;
    case "number":
      gameMetrics[i].value = Math.min((gameMetrics[i].value += data), gameMetrics[i].max);
      gameMetrics[i].value = Math.max(gameMetrics[i].value, 0);
      gameMetrics[i].element.children(".inc").html(("0" + gameMetrics[i].value).slice(-2));
      break;
    case "select":
      gameMetrics[i].value = gameMetrics[i].element.find("option:checked").html();
      break;
    case "text":
      gameMetrics[i].value = `"${gameMetrics[i].element.children("input").val().replace('"', "'")}"`;
      break;
    case "rating":
      gameMetrics[i].element.find(".star").html(`<i class="${unstarred}"></i>`);
      if (data == 0 && gameMetrics[i].value == 1) {
        gameMetrics[i].value = 0;
        return;
      } else {
        gameMetrics[i].value = data + 1;
        for (let j = 0; j <= data + 1; j++) {
          gameMetrics[i].element.find(`div>.star:nth-child(${j})`).html(`<i class="${starred}"></i>`);
        }
      }
  }
  setLocation(scoutLocation);
}

// Create scouting metrics (UI and state variables) from template
function loadTemplate(t) {
  $("#metrics").empty().removeClass("margin-left");
  gameMetrics = [];
  let metricObject, newMetric;
  let currentDiv = $("<div class='flex'></div>");
  $.each(t, (i, metric) => {
    metricObject = { name: metric.name };
    switch (metric.type) {
      case "toggle":
        newMetric = $("<div></div>");
        let button = $(`<button><i class="${unchecked}"></i> ${metric.name}</button>`);
        button.click(() => change(i, metric.type));
        newMetric.append(button);
        metricObject.value = false;
        break;
      case "number":
        newMetric = $(`<div>${metric.name}<br></div>`);
        let incButton = $("<button class='inc'></button>");
        incButton.click(() => change(i, metric.type, 1)).html("00");
        let decButton = $("<button class='dec'></button>");
        decButton.click(() => change(i, metric.type, -1)).html("−");
        newMetric.append(incButton, decButton);
        metricObject.max = metric.max ? Math.min(metric.max, 99) : 99;
        metricObject.value = 0;
        break;
      case "select":
        newMetric = $(`<label>${metric.name}</label>`);
        let select = $("<select></select>");
        select.on("change", () => change(i, metric.type));
        for (let value of metric.values) {
          let option = $("<option></option>");
          option.val(value);
          option.html(value);
          select.append(option);
        }
        newMetric.append(select);
        metricObject.value = metric.values[0];
        break;
      case "text":
        newMetric = $(`<label>${metric.name}</label>`);
        if (metric.length == "long") {
          newMetric.css("width", "100%");
        }
        let input = $("<input>");
        if (metric.tip) {
          input.attr("placeholder", metric.tip);
        }
        input.on("input", () => change(i, metric.type));
        newMetric.append(input);
        metricObject.value = "";
        break;
      case "rating":
        newMetric = $(`<div>${metric.name}</div>`);
        let ratingBar = $("<div class='flex'></div>");
        for (let j = 0; j < 5; j++) {
          let star = $(`<button class='star'><i class="${unstarred}"></i></button>`);
          star.click(() => change(i, metric.type, j));
          ratingBar.append(star);
        }
        newMetric.append(ratingBar);
        metricObject.value = 0;
    }
    newMetric.addClass("margin-bottomleft");
    if (metric.group) {
      if (i > 0) {
        $("#metrics").append(currentDiv);
      }
      if (typeof metric.group == "string") {
        $("#metrics").append(metric.group);
        $("#metrics").addClass("margin-left");
      }
      currentDiv = $(`<div class="flex"></div>`);
    }
    currentDiv.append(newMetric);
    metricObject.element = newMetric;
    metricObject.type = metric.type;
    gameMetrics.push(metricObject);
  });
  $("#metrics").append(currentDiv);
}

let theme = "red";
let scoutLocation = "Red Near";
let matchCount = 1;
let isAbsent = false;

// Sets location and changes theme colors
function setLocation(newLocation) {
  let newTheme = /Blue/.test(newLocation) ? "blue" : "red";
  $("#title, #nav-location, input, select, i, svg, .inc, .star").removeClass(theme).addClass(newTheme);
  localStorage.setItem("location", newLocation);
  $("#nav-location").html(newLocation);
  theme = newTheme;
  scoutLocation = newLocation;
  $("#menu-location").val(scoutLocation);
}

setLocation(localStorage.getItem("location") || "Red Near");
$("#menu-location").change(() => {
  setLocation($("#menu-location").val());
});

// Team, match value restrictions
$("#metric-team").on("input", () => {
  let team = $("#metric-team").val();
  $("#metric-team").val(team.toUpperCase());
  if (!/\w|\d/.test(team.charAt(team.length - 1))
    || /[A-Z]/.test(team.charAt(team.length - 2))
    || (team.length == 5 && /\d/.test(team.charAt(4)))) {
    $("#metric-team").val(team.substring(0, team.length - 1));
  }
  if (team.length > 5) {
    $("#metric-team").val(team.substring(0, 5));
  }
});
$("#metric-match").on("input", () => {
  if ($("#metric-match").val().length > 3) {
    $("#metric-match").val($("#metric-match").val().substring(0, 3));
  }
});

function toggleMenu() {
  $('#menu').toggleClass('show-flex');
}

// Absent toggle
$("#metric-absent").click(() => {
  $("#metrics").toggleClass("hide");
  $("#metric-absent").html(`<i class="${isAbsent ? unchecked : checked} ${theme}"></i> Absent`);
  isAbsent = !isAbsent;
});

// Saves current survey to localStorage and reset metrics
function saveSurvey() {
  if (!/\d{1,4}[A-Z]?/.test($("#metric-team").val())) {
    alert("Please enter a proper team value!");
    $("#metric-team").focus();
    return;
  }
  if (currentTemplate.teams) {
    if (!currentTemplate.teams.some((t) => t == $("#metric-team").val())) {
      alert("Unaccepted team value!");
      $("#metric-team").focus();
      return;
    }
  }
  if (!/\d{1,3}/.test($("#metric-match").val())) {
    alert("Please enter a proper match value!");
    $("#metric-match").focus();
    return;
  }
  let values = `${$("#metric-team").val()},${$("#metric-match").val()},${isAbsent}`;
  for (let metric of gameMetrics) {
    values += `,${metric.value}`;
  }
  if (!confirm("Confirm save?")) {
    return;
  }
  let savedSurveys = localStorage.getItem("surveys");
  localStorage.setItem("surveys", `${savedSurveys || ""}${values}\n`);
  $("#metric-team").val("").focus();
  $("#metric-suffix").val("");
  matchCount = Math.min(parseInt($("#metric-match").val()) + 1, 999);
  $("#metric-match").val(matchCount);
  if (isAbsent) {
    $("#metric-absent").click();
  }
  for (let i = 0; i < gameMetrics.length; i++) {
    switch (gameMetrics[i].type) {
      case "toggle":
        gameMetrics[i].value = false;
        gameMetrics[i].element.find("button").html(`<i class="${unchecked}"></i> ${gameMetrics[i].name}`);
        gameMetrics[i].element.find("i").addClass(theme);
        break;
      case "text":
        gameMetrics[i].value = "";
        gameMetrics[i].element.children("input").val("");
        break;
      case "number":
        gameMetrics[i].value = 0;
        gameMetrics[i].element.children(".inc").html("00");
        break;
      case "select":
        gameMetrics[i].value = gameMetrics[i].element.find("select option").first().val();
        gameMetrics[i].element.children("select").val(gameMetrics[i].value);
        break;
      case "rating":
        gameMetrics[i].value = 0;
        gameMetrics[i].element.find(".star").html(`<i class="${unstarred}"></i>`);
    }
  }
}

// Downloads (and clears) saved surveys from localStorage
function downloadSurveys(askUser = true) {
  if (askUser) {
    if (!confirm("Confirm download?")) {
      return;
    }
  }
  let a = document.createElement("a");
  a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(localStorage.getItem("surveys"))}`;
  a.download = "surveys.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  localStorage.removeItem("surveys");
}
