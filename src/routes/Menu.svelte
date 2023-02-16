<script lang="ts">
  import { currentLocation, menuVisible, savedSurveys, customMetrics, teamWhitelist } from "$lib/stores";
  import { createMetricFromConfig, metricTypes } from "$lib/metrics";
  import {
    locations,
    type FileFormat,
    fileFormats,
    type Survey,
    exampleTemplate,
    type Template,
  } from "$lib/Global.svelte";
  import Metric from "$lib/Metric.svelte";
  import IconButton from "$lib/IconButton.svelte";

  /** Writes the current template to the device's clipboard */
  function copyTemplate() {
    let templateString = JSON.stringify({
      metrics: $customMetrics.map((metric) => metric.config),
      teams: $teamWhitelist,
    });
    if ("clipboard" in navigator) {
      navigator.clipboard.writeText(templateString);
      alert("Copied template");
    } else {
      prompt("Copy the template below", templateString);
    }
  }

  /**
   * Sets a new template
   * @param newTemplate The template to use
   */
  function setTemplate(newTemplate: Template) {
    $customMetrics = newTemplate.metrics.map(createMetricFromConfig);
    if (newTemplate.teams) $teamWhitelist = newTemplate.teams;
  }

  /**
   * Parses a stringified template
   * @param templateString A stringified template
   * @returns A template object or an error string
   */
  function parseTemplate(templateString: string): string | Template {
    let result: Template;
    let error = "";
    try {
      result = JSON.parse(templateString) as Template;
    } catch (e) {
      return "Invalid template string";
    }
    if (!Array.isArray(result.teams ?? [])) {
      error += "Template has invalid teams";
    }
    if (!result.metrics) {
      error += "\nTemplate has no metrics";
    } else {
      result.metrics.forEach((metric, i) => {
        if (!metric.name) {
          error += `\nMetric ${i + 1} has no name`;
        }
        if (metric.type == "select" && !Array.isArray(metric.values ?? [])) {
          error += `\nMetric ${metric.name ?? i + 1} has invalid values`;
        }
        if (!metricTypes.includes(metric.type)) {
          error += `\nMetric ${metric.name ?? i + 1} has invalid type`;
        }
      });
    }
    if (error) {
      return error;
    }
    return result;
  }

  /** Prompts the user to enter a new template, or reset to `exampleTemplate` */
  function editTemplate() {
    const newPrompt = prompt("Paste new template (you can also 'reset'):");
    if (newPrompt) {
      if (newPrompt == "reset") {
        setTemplate(exampleTemplate);
      } else {
        let result = parseTemplate(newPrompt);
        if (typeof result == "string") {
          alert(`Could not set template! ${result}`);
        } else {
          setTemplate(result);
        }
      }
    }
  }

  /** The file type to be utilized when downloading surveys */
  let surveyType: FileFormat = "CSV";

  /**
   * Creates a multiline CSV string for an array of surveys
   * @param surveys An array of surveys (each survey is an array of metric objects)
   */
  function generateCSV(surveys: Survey[]) {
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

  /** Creates and downloads a file containing surveys */
  function downloadSurveys() {
    const anchor = document.createElement("a");
    anchor.href = "data:text/plain;charset=utf-8,";
    if (surveyType == "CSV") {
      anchor.href += encodeURIComponent(generateCSV($savedSurveys));
    } else if (surveyType == "JSON") {
      anchor.href += encodeURIComponent(JSON.stringify($savedSurveys));
    }
    anchor.download = `surveys.${surveyType.toLowerCase()}`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  }

  /** Checks if the user wants to download surveys, doing so if they confirm */
  function askDownloadSurveys() {
    if ($savedSurveys && confirm("Confirm download?")) {
      downloadSurveys();
    }
  }

  /** Confirms the user wants to erase saved surveys, doing so if they confirm */
  function eraseSurveys() {
    if (confirm("Confirm erase?")) {
      $savedSurveys = [];
    }
  }
</script>

<div class="flex space-between spaced bg extend-bg">
  <button id="menu-toggle-btn" on:click={() => ($menuVisible = !$menuVisible)}>
    <img class="text-icon" id="logo" src="./logo.png" alt="" />MeanScout
  </button>
  <span id="location-text">{$currentLocation}</span>
</div>

<div class="flex spaced bg extend-bg" id="menu" class:hide={!$menuVisible}>
  <span class="group">Options</span>
  <Metric
    config={{
      name: "Location",
      type: "select",
      values: Object.values(locations),
    }}
    bind:value={$currentLocation}
  />

  <span class="group">Template</span>
  <IconButton on:click={copyTemplate} icon="copy" text="Copy" />
  <IconButton on:click={editTemplate} icon="pen" text="Edit" />

  <span class="group">Surveys</span>
  <Metric config={{ name: "Type", type: "select", values: Object.values(fileFormats) }} bind:value={surveyType} />
  <IconButton on:click={askDownloadSurveys} icon="download" text="Download" />
  <IconButton on:click={eraseSurveys} icon="erase" text="Erase" />
</div>
