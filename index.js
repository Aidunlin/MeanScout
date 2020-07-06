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

/* Template code */

// Default/example template
let exampleTemplate = {
  name: "Example",
  metrics: [
    { name: "Toggle", type: "toggle", group: "Group" },
    { name: "Number", type: "number", max: 10 },
    {
      name: "Select",
      type: "select",
      values: ["Value 1", "Value 2", "Value 3"],
    },
    { name: "Text", type: "text", tip: "Tip" },
    { name: "Rating", type: "rating" },
  ],
};
let templates = JSON.parse(localStorage.getItem("templates") || null);
let gameMetrics = [];
let currentTemplate;
let isCustom = false;
const unchecked = "far fa-square";
const checked = "fas fa-check-square";
const unstarred = "far fa-star";
const starred = "fas fa-star";

// Populate template picker with template options, select previously selected template
$.each(templates, (i, template) => {
  $("#template").prepend(new Option(template.name, template.name));
  if (template.selected) {
    currentTemplate = template;
    isCustom = true;
    loadTemplate(template.metrics);
    $("#template").val(currentTemplate.name);
  }
});
if (!isCustom) {
  currentTemplate = exampleTemplate;
  loadTemplate(exampleTemplate.metrics);
  $("#template").val(currentTemplate.name);
}
if (currentTemplate.teams) {
  $.each(currentTemplate.teams, (_i, team) => {
    $("#teams").append(`<option value="${team}">`);
  });
}

// Change to selected template
function setTemplate() {
  if (localStorage.getItem("surveys")) {
    download(false);
  }
  isCustom = false;
  $.each(templates, (_i, template) => {
    template.selected = false;
    if ($("#template").val() == template.name) {
      currentTemplate = template;
      isCustom = true;
      template.selected = true;
      loadTemplate(template.metrics);
    }
  });
  if (!isCustom) {
    currentTemplate = exampleTemplate;
    loadTemplate(exampleTemplate.metrics);
    $("#template").val(currentTemplate.name);
  }
  if (currentTemplate.teams) {
    $.each(currentTemplate.teams, (_i, team) => {
      $("#teams").append(`<option value="${team}">`);
    });
  }
  setLocation(scoutLocation);
  localStorage.setItem("templates", JSON.stringify(templates));
}

// Create and select new template from JSON text
function newTemplate() {
  let newPrompt = prompt("Paste new template:");
  if (newPrompt) {
    let newTemplate = JSON.parse(newPrompt);
    if (Array.isArray(newTemplate)) {
      newTemplate = newTemplate[0];
    }
    newTemplate.selected = true;
    let error = false;
    if (newTemplate.name == exampleTemplate.name) {
      error = "Template has same name as example";
    }
    if (newTemplate.name && newTemplate.metrics) {
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
    let skip = false;
    $.each(templates, (_i, template) => {
      if (newTemplate.name == template.name) {
        if (confirm(`Replace ${newTemplate.name}?`)) {
          $.each(templates, (i, template) => {
            if (template.name == currentTemplate.name) {
              templates.splice(i, 1);
              return false;
            }
          });
          $("#template option:checked").remove();
          setTemplate();
          localStorage.setItem("templates", JSON.stringify(templates));
        } else {
          skip = true;
          return false;
        }
      }
    });
    if (!skip) {
      templates.unshift(newTemplate);
      $("#template").prepend(new Option(newTemplate.name, newTemplate.name));
      $("#template").val(newTemplate.name);
      setTemplate();
    }
  }
}

function copyTemplate() {
  let input = $("<input>");
  let templateToCopy = currentTemplate;
  delete templateToCopy["selected"];
  $("body").append(input);
  input.attr("value", JSON.stringify(templateToCopy));
  input.select();
  document.execCommand("copy");
  $(input).remove();
  alert(`Copied ${currentTemplate.name}`);
}

function removeTemplate() {
  if (!isCustom) {
    alert("The example template cannot be removed.");
    return;
  }
  if (prompt(`Type "${currentTemplate.name}" to remove the template`)) {
    $.each(templates, (i, template) => {
      if (template.name == currentTemplate.name) {
        templates.splice(i, 1);
        return false;
      }
    });
    $("#template option:checked").remove();
    setTemplate();
    localStorage.setItem("templates", JSON.stringify(templates));
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
      gameMetrics[i].value = gameMetrics[i].element.children("input").val();
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
        newMetric = $(`<div>${metric.name} <br></div>`);
        let incButton = $("<button class='inc'></button>");
        incButton.click(() => change(i, metric.type, 1)).html("00");
        let decButton = $("<button class='dec'></button>");
        decButton.click(() => change(i, metric.type, -1)).html("−");
        newMetric.append(incButton, decButton);
        metricObject.max = metric.max ? Math.min(metric.max, 99) : 99;
        metricObject.value = 0;
        break;
      case "select":
        newMetric = $(`<label>${metric.name} <br></label>`);
        let select = $("<select></select>");
        select.on("change", () => change(i, metric.type));
        $.each(metric.values, (index, selValue) => {
          let option = $("<option></option>");
          option.html(selValue);
          select.append(option);
        });
        newMetric.append(select);
        metricObject.value = metric.values[0];
        break;
      case "text":
        newMetric = $(`<label>${metric.name} <br></label>`);
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
        newMetric = $(`<div>${metric.name} <br></div>`);
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

/* End template code */

let theme = "red";
let scoutLocation = "Red Near";
let matchCount = 1;
let isAbsent = false;

// Sets location and changes theme colors
function setLocation(newLocation) {
  let newTheme = /Blue/.test(newLocation) ? "blue" : "red";
  $("#title, #nav-location, input, select, i, svg, .inc, .star").removeClass(theme).addClass(newTheme);
  $("button:not(#metrics button, #metric-absent)").removeClass(theme).addClass(newTheme);
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

$("#menu-toggle").click(() => {
  $('#menu').toggleClass('show-flex');
});

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
  $.each(gameMetrics, (_i, metric) => {
    values += `,${metric.type == "select" ? `"${metric.value.replace('"', "'")}"` : metric.value}`;
  });
  if (!confirm("Confirm save?")) {
    return;
  }
  let savedSurveys = localStorage.getItem("surveys");
  localStorage.setItem("surveys", `${savedSurveys || ""}${values}\n`);
  $("#metric-team").val("").focus();
  $("#metric-suffix").val("");
  matchCount = Math.max(parseInt($("#metric-match").val()) + 1, 999);
  $("#metric-match").val(matchCount);
  if (isAbsent) {
    $("#metric-absent").click();
  }
  $.each(gameMetrics, (_i, metric) => {
    switch (metric.type) {
      case "toggle":
        metric.element.find("button").html(`<i class="${unchecked}"></i> ${metric.name}`);
        metric.element.find("i").addClass(theme);
        metric.value = false;
        break;
      case "text":
        metric.element.children("input").val("");
        metric.value = "";
        break;
      case "number":
        metric.element.children(".inc").html("00");
        metric.value = 0;
        break;
      case "select":
        metric.element.children("select").val(0);
        metric.value = metric.element.find("select option:checked").html();
        break;
      case "rating":
        metric.element.find(".star").html(`<i class="${unstarred}"></i>`);
        metric.value = 0;
    }
  });
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
  a.download = `${currentTemplate.name} Surveys.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  localStorage.setItem("surveys", "");
}
