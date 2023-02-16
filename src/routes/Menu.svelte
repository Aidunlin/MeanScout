<script lang="ts">
  import {
    currentLocation,
    menuVisible,
    savedSurveys,
    customMetrics,
    teamWhitelist,
    surveyFileType,
  } from "$lib/stores";
  import { downloadSurveys, surveyFileTypes } from "$lib/surveys";
  import { createMetricFromConfig } from "$lib/metrics";
  import { exampleTemplate, parseTemplate, type Template } from "$lib/templates";
  import { locations } from "$lib/locations";
  import Metric from "./Metric.svelte";
  import IconButton from "./IconButton.svelte";

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

  /** Checks if the user wants to download surveys, doing so if they confirm */
  function askDownloadSurveys() {
    if ($savedSurveys && confirm("Confirm download?")) {
      downloadSurveys($surveyFileType, $savedSurveys);
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
  <Metric
    config={{ name: "Type", type: "select", values: Object.values(surveyFileTypes) }}
    bind:value={$surveyFileType}
  />
  <IconButton on:click={askDownloadSurveys} icon="download" text="Download" />
  <IconButton on:click={eraseSurveys} icon="erase" text="Erase" />
</div>
