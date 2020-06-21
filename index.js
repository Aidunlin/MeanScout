// Check if user wants to reload/close
window.onbeforeunload = () => {
  if (window.location.hostname.includes("aidunlin.codes")) return true;
};

// Register service worker
if ("serviceWorker" in navigator) window.onload = () => navigator.serviceWorker.register("./sw.js");

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

// Team, match value restrictions
$("#metric-team").on("input", () => {
  $("#metric-team").val($("#metric-team").val().toUpperCase());
  if (!"01234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes($("#metric-team").val().substring($("#metric-team").val().length-1))) {
    $("#metric-team").val($("#metric-team").val().substring(0, $("#metric-team").val().length - 1));
  }
  if ("ABCDEFGHIJKLMNOPQRSTUVWXYZ".includes($("#metric-team").val().substr($("#metric-team").val().length-2, 1))) {
    $("#metric-team").val($("#metric-team").val().substring(0, $("#metric-team").val().length - 1));
  }
  if ($("#metric-team").val().length == 5 && "01234567890".includes($("#metric-team").val().substr(4, 1))) {
    $("#metric-team").val($("#metric-team").val().substring(0, $("#metric-team").val().length - 1));
  }
  if ($("#metric-team").val().length > 5) $("#metric-team").val($("#metric-team").val().substring(0, 5));
});
$("#metric-match").on("input", () => {
  if ($("#metric-match").val().length > 3) $("#metric-match").val($("#metric-match").val().substring(0, 3));
});

// Absent toggle
$("#metric-absent").click(() => {
  $("#metrics").toggleClass("hide");
  $("#metric-absent").html(`<i class="${isAbsent ? unchecked : checked} text-${theme}"></i> Absent`);
  isAbsent = !isAbsent;
});

// Menu toggle
$("#menu-toggle").click(() => $("#menu").toggleClass("hide"));

// Saves current survey to localstorage and reset metrics
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
    values += `,${["text", "select"].includes(metric.type) ? `"${metric.value.replace('"', "'")}"` : metric.value}`;
  });
  if (!confirm("Confirm save?")) return;
  let savedSurveys = localStorage.getItem("surveys");
  localStorage.setItem("surveys", `${savedSurveys || ""}${values}\n`);
  $("#metric-team").val("").focus();
  $("#metric-suffix").val("");
  matchCount = Math.max(parseInt($("#metric-match").val()) + 1, 999);
  $("#metric-match").val(matchCount);
  if (isAbsent) $("#metric-absent").click();
  $.each(gameMetrics, (_i, metric) => {
    switch (metric.type) {
      case "toggle":
        metric.element.find("button").html(`<i class="${unchecked}"></i> ${metric.name}`);
        metric.element.find("i").addClass(`text-${theme}`);
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

// Downloads and clears saved surveys from localStorage
function download(askUser = true) {
  if (askUser) if (!confirm("Confirm download?")) return;
  let a = document.createElement("a");
  a.href = `data:text/plain;charset=utf-8,${encodeURIComponent(localStorage.getItem("surveys"))}`;
  a.download = `${currentTemplate.name} Surveys.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  localStorage.setItem("surveys", "");
}
