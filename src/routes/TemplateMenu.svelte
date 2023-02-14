<script lang="ts">
  import {
    ms,
    exampleTemplate,
    metricDefaults,
    type Template,
    createMetricFromConfig,
  } from "$lib/Global.svelte";
  import IconButton from "$lib/IconButton.svelte";

  /** Writes the current template to the device's clipboard */
  function copyTemplate() {
    let templateString = JSON.stringify({
      metrics: $ms.metrics.map((metric) => metric.config),
      teams: $ms.teams,
    });
    if ("clipboard" in navigator) {
      navigator.clipboard.writeText(templateString);
      alert("Copied template");
    } else {
      prompt("Copy the template below", templateString);
    }
  }

  /**
   * Sets a new template (or resets to `exampleTemplate`), updates `localStorage` and `$ms.metrics`
   * @param newTemplate (optional) The template to use
   */
  function setTemplate(newTemplate: Template) {
    localStorage.setItem("template", JSON.stringify(newTemplate));
    localStorage.removeItem("backup");
    $ms.metrics = newTemplate.metrics.map(createMetricFromConfig);
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
        if (!metricDefaults.some((type) => type.name == metric.type)) {
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
        localStorage.removeItem("template");
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
</script>

<span class="group">Template</span>
<IconButton on:click={copyTemplate} icon="copy" text="Copy" />
<IconButton on:click={editTemplate} icon="pen" text="Edit" />
