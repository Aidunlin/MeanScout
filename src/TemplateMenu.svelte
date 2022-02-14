<script>
  import {
    ms,
    exampleTemplate,
    metricTypes,
    getMetricDefaultValue,
  } from "./global.js";
  import IconButton from "./IconButton.svelte";

  /** Writes the current template to the device's clipboard */
  function copyTemplate() {
    let templateString = JSON.stringify($ms.currentTemplate);

    if ("clipboard" in navigator) {
      navigator.clipboard.writeText(templateString);
      alert("Copied template");
    } else {
      prompt("Copy the template below", templateString);
    }
  }

  /**
   * Sets a new template (or resets to `exampleTemplate`), updates `localStorage` and `$ms.customMetrics`
   * @param newTemplate (optional) The template to use
   */
  function setTemplate(newTemplate) {
    $ms.currentTemplate = JSON.parse(
      JSON.stringify(newTemplate ?? exampleTemplate)
    );

    localStorage.setItem("template", JSON.stringify($ms.currentTemplate));
    localStorage.removeItem("backup");

    $ms.customMetrics = $ms.currentTemplate.metrics.map((metric) => {
      let defaultValue = getMetricDefaultValue(metric.type);

      if (metric.type == "select") {
        defaultValue = metric.values[0];
      }

      return { ...metric, value: defaultValue, default: defaultValue };
    });
  }

  /**
   * Checks if a stringified template is valid
   * @param templateString A stringified template
   * @returns An object containing a template object or error string
   */
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

  /** Prompts the user to enter a new template, or reset to `exampleTemplate` */
  function editTemplate() {
    const newPrompt = prompt("Paste new template (you can also 'reset'):");

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
</script>

<span class="group">Template</span>
<IconButton on:click={copyTemplate} icon="copy" text="Copy" />
<IconButton on:click={editTemplate} icon="pen" text="Edit" />
