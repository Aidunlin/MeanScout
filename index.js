// Check if user wants to reload/close
window.onbeforeunload = () => {
  if (window.location.hostname.includes("aidunlin.codes")) return true;
};

// Register service worker
if ("serviceWorker" in navigator) window.onload = () => navigator.serviceWorker.register("./sw.js");
else alert("Your browser doesn't support offline web apps, so you won't be able to scout offline.");

let theme = "white";
let scoutLocation = "None";
let matchCount = 1;
let isAbsent = false;

// Sets location and changes theme colors
function setLocation(newLocation) {
  let newTheme;
  if (newLocation.includes("Red")) newTheme = "red";
  else if (newLocation.includes("Blue")) newTheme = "blue";
  else newTheme = "white";
  $("#title, #nav-location, input, select, i, svg, .inc, .star").removeClass(`text-${theme}`).addClass(`text-${newTheme}`);
  $("button:not(#metrics button, #metric-absent)").removeClass(`text-${theme}`).addClass(`text-${newTheme}`);
  localStorage.setItem("location", newLocation);
  $("#nav-location").html(newLocation);
  theme = newTheme;
  scoutLocation = newLocation;
}

setLocation(localStorage.getItem("location") || "None");
$("#menu-location").val(scoutLocation).change(() => setLocation($("#menu-location").val()));

// Show everything after code above finishes
$("html").removeClass("hide");

// Team, match value restrictions
$("#metric-team, #metric-match").keypress((event) => {
  if ((event.which != 8 && event.which != 0 && event.which < 48) || event.which > 57) {
    event.preventDefault();
  }
});
$("#metric-suffix").keypress((event) => {
  if (!"abcdefghijklmnopqrstuvwxyz".includes(event.key.toLowerCase())) {
    event.preventDefault();
  } else {
    $("#metric-suffix").val("");
  }
});
$("#metric-team").on("input", () => {
  if ($("#metric-team").val().length > 4) {
    $("#metric-team").val($("#metric-team").val().substring(0, 4));
  }
});
$("#metric-suffix").on("input", () => {
  $("#metric-suffix").val($("#metric-suffix").val().toUpperCase());
  if ($("#metric-suffix").val().length > 1) {
    $("#metric-suffix").val($("#metric-suffix").val().substring(0, 1));
  }
});
$("#metric-match").on("input", () => {
  if ($("#metric-match").val().length > 3) {
    $("#metric-match").val($("#metric-match").val().substring(0, 3));
  }
});

// Absent toggle
$("#metric-absent").click(() => {
  $("#metrics").toggleClass("hide");
  $("#metric-absent").empty();
  $("#metric-absent").append(`<i class='${isAbsent ? "far fa-square" : "fas fa-check-square"} text-${theme}'></i> Absent`);
  isAbsent = !isAbsent;
});

// menu toggle
$("#menu-toggle").click(() => {
  $("#menu").toggleClass("hide");
});

// Saves current survey to localstorage and reset metrics
function saveSurvey() {
  if (!/\d{1,4}/.test($("#metric-team").val())) {
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
  if (!/\d{1,3}/.test($("#metric-match").val()) || $("#metric-match").val().length > 3) {
    alert("Please enter a proper match value!");
    $("#metric-match").focus();
    return;
  }
  let values = `${$("#metric-team").val() + ($("#suffix").val() || "")}`;
  values += `,${$("#metric-match").val()},${isAbsent}`;
  $.each(gameMetrics, (_i, metric) => {
    values += `,${metric.type == "text" ? `"${metric.value.replace('"', "'")}"` : metric.value}`;
  });

  if (!confirm("Confirm save?")) {
    return;
  }
  let savedSurveys = localStorage.getItem("surveys");
  localStorage.setItem("surveys", `${savedSurveys || ""}${values}\n`);

  $("#metric-team").val("").focus();
  $("#metric-suffix").val("");
  matchCount = parseInt($("#metric-match").val()) + 1;
  $("#metric-match").val(matchCount);
  if (isAbsent) {
    $("#metric-absent").click();
  }
  $.each(gameMetrics, (_i, metric) => {
    switch (metric.type) {
      case "toggle":
        metric.element.find("button").empty();
        metric.element.find("button").append(`<i class='far fa-square'></i> ${metric.name}`);
        metric.element.find("i").addClass(`text-${theme}`);
        metric.value = false;
        break;
      case "text":
        metric.element.children("input").val("");
        metric.value = "";
        break;
      case "number":
        metric.element.children(".inc").html("0");
        metric.value = 0;
        break;
      case "select":
        metric.element.children("select").val(0);
        metric.value = metric.element.find("select option:checked").html();
        break;
      case "rating":
        metric.element.find(".star").html('<i class="far fa-star"></i>');
        metric.value = 0;
    }
  });
}

// Downloads and clears saved surveys from localStorage
function download(askUser = true) {
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
