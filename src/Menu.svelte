<script>
  import { msData, metricTypes, exampleTemplate } from "./stores.js";
  import Icon from "./Icon.svelte";
  import { SelectMetric } from "./metrics/metrics.js";

  let locations = [
    "Red Near",
    "Red Mid",
    "Red Far",
    "Blue Near",
    "Blue Mid",
    "Blue Far",
  ];

  let surveyTypes = ["CSV", "JSON"];
  let surveyType = surveyTypes[0];

  function locationUpdated() {
    let newTheme = "red";
    if (/blue/.test($msData.location.toLowerCase())) newTheme = "blue";
    document.documentElement.style.setProperty(
      "--theme-color",
      `var(--${newTheme})`
    );
    localStorage.location = $msData.location;
  }

  function copyTemplate() {
    if ("clipboard" in navigator) {
      navigator.clipboard.writeText(JSON.stringify($msData.currentTemplate));
      alert("Copied template");
    } else {
      prompt("Copy the template below", JSON.stringify($msData.currentTemplate));
    }
  }

  function setTemplate(newTemplate = null) {
    localStorage.backup = "";
    $msData.currentTemplate = JSON.parse(JSON.stringify(newTemplate ?? $exampleTemplate));
    localStorage.template = JSON.stringify($msData.currentTemplate);
    $msData.customMetrics = $msData.currentTemplate.metrics.map((metric) => {
      let defaultValue = $metricTypes.find(type => type.name == metric.type).default;
      if (metric.type == "select") {
        defaultValue = metric.values[0];
      }
      return { ...metric, value: defaultValue, default: defaultValue };
    });

  }

  function editTemplate() {
    const newPrompt = prompt("Pase new template (you can also 'reset'):");
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
            if (!metric.type in $metricTypes) {
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

  function downloadSurveys() {
    const anchor = document.createElement("a");
    anchor.href = "data:text/plain;charset=utf-8,";
    if (surveyType == "CSV") {
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
    } else if (surveyType == "JSON") {
      anchor.href += encodeURIComponent(localStorage.surveys);
      anchor.download = "surveys.json";
    } 
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  }

  function askDownloadSurveys() {
    if (confirm("Confirm download?")) {
      downloadSurveys();
    }
  }

  function eraseSurveys() {
    if (prompt("Type 'erase' to erase saved surveys") == "erase") {
      localStorage.surveys = "[]";
    }
  }

  function load() {
    if (localStorage.location) {
      $msData.location = localStorage.location;
      locationUpdated();
    }
  }
</script>

<svelte:window on:load={load} />

<div class="flex" id="menu" class:hide={!$msData.menuVisible}>
  <span class="group">Options</span>
  <div class="flex spaced">
    <SelectMetric
      name="Location"
      values={locations}
      bind:value={$msData.location}
      on:updated={locationUpdated}
    />
    <div>
      Template
      <div class="flex">
        <button id="template-copy-btn" on:click={copyTemplate}>
          <Icon name="copy" text="Copy" />
        </button>
        <button id="template-edit-btn" on:click={editTemplate}>
          <Icon name="pen" text="Edit" />
        </button>
      </div>
    </div>
    <div>
      Surveys
      <div class="flex">
        <SelectMetric name="" values={surveyTypes} bind:value={surveyType} />
        <button id="surveys-download-btn" on:click={askDownloadSurveys}>
          <Icon name="download" text="Download" />
        </button>
        <button id="surveys-erase-btn" on:click={eraseSurveys}>
          <Icon name="erase" text="Erase" />
        </button>
      </div>
    </div>
  </div>
</div>
