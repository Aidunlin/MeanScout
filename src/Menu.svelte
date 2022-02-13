<script>
  import {
    msData,
    exampleTemplate,
    metricTypes,
    getDefaultValue,
    locations,
    surveyTypes,
  } from "./stores.js";
  import Icon from "./Icon.svelte";
  import Metric from "./Metric.svelte";

  let surveyType = surveyTypes[0];

  function locationUpdated() {
    localStorage.location = $msData.location;
    let newTheme = "";

    if ($msData.location.toLowerCase().includes("red")) {
      newTheme = "red";
    } else if ($msData.location.toLowerCase().includes("blue")) {
      newTheme = "blue";
    }

    document.documentElement.style.setProperty(
      "--theme-color",
      `var(--${newTheme})`
    );
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
    $msData.currentTemplate = JSON.parse(
      JSON.stringify(newTemplate ?? exampleTemplate)
    );

    localStorage.template = JSON.stringify($msData.currentTemplate);
    localStorage.backup = "";

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

  function generateCSV(surveys) {
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
    return csv;
  }

  function downloadSurveys() {
    const anchor = document.createElement("a");
    anchor.href = "data:text/plain;charset=utf-8,";

    if (surveyType == "CSV") {
      anchor.href += encodeURIComponent(
        generateCSV(JSON.parse(localStorage.surveys))
      );
    } else if (surveyType == "JSON") {
      anchor.href += encodeURIComponent(localStorage.surveys);
    }

    anchor.download = `surveys.${surveyType.toLowerCase()}`;
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

<div class="flex spaced bg" id="menu" class:hide={!$msData.menuVisible}>
  <Metric
    name="Location"
    type="select"
    values={locations}
    bind:value={$msData.location}
    on:update={locationUpdated}
  />

  <span class="group">Template</span>
  <button on:click={copyTemplate}>
    <Icon name="copy" text="Copy" />
  </button>
  <button on:click={editTemplate}>
    <Icon name="pen" text="Edit" />
  </button>

  <span class="group">Surveys</span>
  <Metric
    name="Type"
    type="select"
    values={surveyTypes}
    bind:value={surveyType}
  />
  <button on:click={askDownloadSurveys}>
    <Icon name="download" text="Download" />
  </button>
  <button on:click={eraseSurveys}>
    <Icon name="erase" text="Erase" />
  </button>
</div>
