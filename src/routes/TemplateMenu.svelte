<script lang="ts">
  import {
    ms,
    exampleTemplate,
    metricDefaults,
    getMetricDefaultValue,
    type Template,
  } from "./Global.svelte";
  import IconButton from "./IconButton.svelte";

  /** Writes the current template to the device's clipboard */
  function copyTemplate() {
    let templateString = JSON.stringify($ms.template);
    if ("clipboard" in navigator) {
      navigator.clipboard.writeText(templateString);
      alert("Copied template");
    } else prompt("Copy the template below", templateString);
  }

  /**
   * Sets a new template (or resets to `exampleTemplate`), updates `localStorage` and `$ms.metrics`
   * @param newTemplate (optional) The template to use
   */
  function setTemplate(newTemplate?: Template) {
    $ms.template = JSON.parse(JSON.stringify(newTemplate ?? exampleTemplate));
    localStorage.setItem("template", JSON.stringify($ms.template));
    localStorage.removeItem("backup");
    $ms.metrics = $ms.template.metrics.map((metric) => {
      let defaultValue = getMetricDefaultValue(metric.type);
      if (metric.type == "select") defaultValue = metric.values[0];
      return { ...metric, value: defaultValue, default: defaultValue };
    });
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
    if (!Array.isArray(result.teams ?? []))
      error += "Template has invalid teams";
    if (!result.metrics) error += "\nTemplate has no metrics";
    else {
      result.metrics.forEach((metric, i) => {
        if (!metric.name) error += `\nMetric ${i + 1} has no name`;
        if (metric.type == "select" && !Array.isArray(metric.values ?? []))
          error += `\nMetric ${metric.name ?? i + 1} has invalid values`;
        if (!metricDefaults.some((type) => type.name == metric.type))
          error += `\nMetric ${metric.name ?? i + 1} has invalid type`;
      });
    }
    if (error) return error;
    return result;
  }

  /** Prompts the user to enter a new template, or reset to `exampleTemplate` */
  function editTemplate() {
    const newPrompt = prompt("Paste new template (you can also 'reset'):");
    if (newPrompt) {
      if (newPrompt == "reset") {
        setTemplate();
        localStorage.removeItem("template");
      } else {
        let result = parseTemplate(newPrompt);
        if (typeof result == "string")
          alert(`Could not set template! ${result}`);
        else setTemplate(result);
      }
    }
  }
</script>

<span class="group">Template</span>
<IconButton on:click={copyTemplate} icon="copy" text="Copy" />
<IconButton on:click={editTemplate} icon="pen" text="Edit" />
