// Default/example template
let exampleTemplate = {
  name: "Example",
  metrics: [
    { name: "Toggle", type: "toggle", group: "Group", },
    { name: "Number", type: "number", max: 10, },
    { name: "Select", type: "select", values: ["Value 1", "Value 2", "Value 3"], },
    { name: "Text", type: "text", tip: "Tip", },
    { name: "Rating", type: "rating", },
  ],
};
let templates = [];
let gameMetrics = [];
let currentTemplate;
let isCustom = false;
const unchecked = "far fa-square", checked = "fas fa-check-square";
const unstarred = "far fa-star", starred = "fas fa-star";
if (localStorage.getItem("templates")) templates = JSON.parse(localStorage.getItem("templates"));

// Populate template picker with template options, select previously selected template
$.each(templates, (i, template) => {
  $("#template").prepend(new Option(template.name, template.name));
  if (template.selected) {
    currentTemplate = template;
    isCustom = true;
    loadTemplate(template.metrics);
    $("#template").val(currentTemplate.name);
    $("#nav-template").html(currentTemplate.name);
  }
});
if (!isCustom) {
  currentTemplate = exampleTemplate;
  loadTemplate(exampleTemplate.metrics);
  $("#template").val(currentTemplate.name);
  $("#nav-template").html(currentTemplate.name);
}
if (currentTemplate.teams) $.each(currentTemplate.teams, (_i, team) => $("#teams").append(`<option value="${team}">`));
localStorage.setItem("templates", JSON.stringify(templates));

// Change to selected template
function setTemplate() {
  if (localStorage.getItem("surveys")) download(false);
  isCustom = false;
  $.each(templates, (_i, template) => {
    template.selected = false;
    if ($("#template").val() == template.name) {
      currentTemplate = template;
      isCustom = true;
      template.selected = true;
      loadTemplate(template.metrics);
      $("#nav-template").html(currentTemplate.name);
    }
  });
  if (!isCustom) {
    currentTemplate = exampleTemplate;
    loadTemplate(exampleTemplate.metrics);
    $("#template").val(currentTemplate.name);
    $("#nav-template").html(currentTemplate.name);
  }
  if (currentTemplate.teams) $.each(currentTemplate.teams, (_i, team) => $("#teams").append(`<option value="${team}">`));
  setLocation(currentLocation);
  localStorage.setItem("templates", JSON.stringify(templates));
}
$("#template").change(() => {
  setTemplate();
});

// Create and select new template from JSON text
$("#template-new").click(() => {
  let newPrompt = prompt("Type/paste new template:");
  if (newPrompt) {
    let newTemplate = JSON.parse(newPrompt);
    if (Array.isArray(newTemplate)) newTemplate = newTemplate[0];
    newTemplate.selected = true;
    let error = false;
    if (newTemplate.name == exampleTemplate.name) error = "Template has same name as example";
    if (newTemplate.name && newTemplate.metrics) {
      $.each(newTemplate.metrics, (i, metric) => {
        if (!metric.name) error = `Metric ${i}: no name`;
        else if (metric.type == "number" && metric.max < 1) error = `Metric ${i}: max is less than one`;
        else if (metric.type == "select" && !metric.values) error = `Metric ${i}: no values`;
        else if (!["toggle", "number", "select", "text", "rating"].includes(metric.type)) error = `Metric ${i}: unkown type`;
      });
    } else error = "Template is invalid";
    if (error) {
      alert(`Could not add template! ${error}`);
      return;
    }
    let skip = false;
    $.each(templates, (_i, template) => {
      if (newTemplate.name == template.name) {
        if (confirm(`${newTemplate.name} already exists. Replace current template?`)) {
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
});

$("#template-copy").click(() => {
  let input = $("<input>");
  let templateToCopy = currentTemplate;
  delete templateToCopy["selected"];
  $("body").append(input);
  input.attr("value", JSON.stringify(templateToCopy));
  input.select();
  document.execCommand("copy");
  $(input).remove();
  alert(`Copied ${currentTemplate.name}`);
});

$("#template-remove").click(() => {
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
});

// Handles metric UI/value changes
function change(i, type, data = 0) {
  switch (type) {
    case "toggle":
      gameMetrics[i].element.find("button").html(`<i class="${gameMetrics[i].value ? unchecked : checked}"></i> ${gameMetrics[i].name}`);
      gameMetrics[i].value = !gameMetrics[i].value;
      break;
    case "number":
      gameMetrics[i].value = Math.max(Math.min((gameMetrics[i].value += data), gameMetrics[i].max), 0);
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
        for (let j = 0; j <= data + 1; j++) gameMetrics[i].element.find(`div>.star:nth-child(${j})`).html(`<i class="${unstarred}"></i>`);
      }
  }
  setLocation(scoutLocation);
}

// Create scouting metrics (UI and state variables) from template
function loadTemplate(t) {
  $("#metrics").empty();
  gameMetrics = [];
  let metricObject, newMetric, currentDiv = $("<div class='flex'></div>");
  $.each(t, (i, metric) => {
    metricObject = { name: metric.name };
    switch (metric.type) {
      case "toggle":
        newMetric = $("<div></div>");
        let button = $("<button></button>");
        button.addClass("ripple").html(`<i class="${unchecked}"></i> ${metric.name}`).click(() => change(i, metric.type));
        newMetric.append(button);
        metricObject.value = false;
        break;
      case "number":
        newMetric = $("<div></div>");
        newMetric.append(`${metric.name} <br>`);
        let incButton = $("<button></button>");
        incButton.addClass("inc ripple").click(() => change(i, metric.type, 1)).html("00");
        let decButton = $("<button></button>");
        decButton.addClass("dec ripple").click(() => change(i, metric.type, -1)).html("−");
        newMetric.append(incButton, decButton);
        if (metric.max) metricObject.max = Math.min(metric.max, 99);
        else metricObject.max = 99;
        metricObject.value = 0;
        break;
      case "select":
        newMetric = $("<label></label>");
        newMetric.append(`${metric.name} <br>`);
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
        newMetric = $("<label></label>");
        newMetric.append(`${metric.name} <br>`);
        if (metric.length == "long") newMetric.css("width", "100%");
        let input = $("<input>");
        if (metric.tip) input.attr("placeholder", metric.tip);
        input.on("input", () => change(i, metric.type));
        newMetric.append(input);
        metricObject.value = "";
        break;
      case "rating":
        newMetric = $("<div></div>");
        newMetric.append(`${metric.name} <br>`);
        let ratingBar = $("<div></div>");
        ratingBar.css("width", "fit-content");
        for (let j = 0; j < 5; j++) {
          let star = $("<button></button>");
          star.addClass("star ripple").html(`<i class="${unstarred}"></i>`).click(() => change(i, metric.type, j));
          ratingBar.append(star);
        }
        newMetric.append(ratingBar);
        metricObject.value = 0;
    }
    newMetric.addClass("margin-leftbottom");
    if (metric.group) {
      if (i > 0) $("#metrics").append(currentDiv);
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
