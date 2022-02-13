<script>
  import { msData, exampleTemplate } from "./stores.js";
  import Icon from "./Icon.svelte";
  import Metric, { metricTypes, getDefaultValue } from "./Metric.svelte";

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

    if (/blue/.test($msData.location.toLowerCase())) {
      newTheme = "blue";
    }

    document.documentElement.style.setProperty(
      "--theme-color",
      `var(--${newTheme})`
    );

    localStorage.location = $msData.location;
  }

  function copyTemplate() {
    let templateString = JSON.stringify($msData.currentTemplate);

    if ("clipboard" in navigator) {
      navigator.clipboard.writeText(templateString);
      alert("Copied template");
    } else {
      prompt("Copy the template below", templateString);
    }
  }

  function setTemplate(newTemplate = null) {
    localStorage.backup = "";

    $msData.currentTemplate = JSON.parse(
      JSON.stringify(newTemplate ?? $exampleTemplate)
    );
    localStorage.template = JSON.stringify($msData.currentTemplate);

    $msData.customMetrics = $msData.currentTemplate.metrics.map((metric) => {
      let defaultValue = getDefaultValue(metric.type);

      if (metric.type == "select") {
        defaultValue = metric.values[0];
      }
      
      return { ...metric, value: defaultValue, default: defaultValue };
    });
  }

  function validateTemplate(templateString) {
    let result = {
      template: {},
      error: "",
    };

    try {
      result.template = JSON.parse(templateString);
    } catch (e) {
      result.error = e;
      return result;
    }

    if (!Array.isArray(result.template.teams ?? [])) {
      result.error += "Template has invalid teams";
    }

    if (result.template.metrics) {
      result.template.metrics.forEach((metric, i) => {
        if (!metric.name) {
          result.error += `\nMetric ${i + 1} has no name`;
        }

        if (!Array.isArray(metric.values ?? [])) {
          result.error += `\nMetric ${metric.name ?? i + 1} has invalid values`;
        }

        if (!metricTypes.some((type) => type.name == metric.type)) {
          result.error += `\nMetric ${metric.name ?? i + 1} has invalid type`;
        }
      });
    } else {
      result.error += "\nTemplate has no metrics";
    }

    return result;
  }

  function editTemplate() {
    const newPrompt = prompt("Pase new template (you can also 'reset'):");

    if (newPrompt) {
      if (newPrompt == "reset") {
        setTemplate();
      } else {
        let result = validateTemplate(templateString);

        if (result.error) {
          alert(`Could not set template! ${result.error}`);
        } else {
          setTemplate(result.template);
        }
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
        surveys.forEach((survey) => {
          let surveyAsCSV = "";

          survey.forEach((metric) => {
            if (typeof metric.value == "string") {
              surveyAsCSV += '"' + metric.value + '",';
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
    <Metric
      name="Location"
      type="select"
      values={locations}
      bind:value={$msData.location}
      on:update={locationUpdated}
    />

    <div>
      Template
      <div class="flex">
        <button on:click={copyTemplate}>
          <Icon name="copy" text="Copy" />
        </button>
        <button on:click={editTemplate}>
          <Icon name="pen" text="Edit" />
        </button>
      </div>
    </div>

    <span class="group">Surveys</span>
    <div class="flex">
      <Metric
        name=""
        type="select"
        values={surveyTypes}
        bind:value={surveyType}
      />
      <button on:click={askDownloadSurveys}>
        <Icon name="download" text="Download" />
      </button>
    </div>
    <button on:click={eraseSurveys}>
      <Icon name="erase" text="Erase" />
    </button>
  </div>
</div>
