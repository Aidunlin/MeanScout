import { metricTypes, type MetricConfig } from "./metrics";

export type Template = {
  metrics: MetricConfig[];
  teams?: string[];
};

/** Default template used to showcase different metrics */
export const exampleTemplate: Template = {
  metrics: [
    { name: "Toggle", type: "toggle", group: "Group" },
    { name: "Number", type: "number" },
    {
      name: "Select",
      type: "select",
      values: ["Value 1", "Value 2", "Value 3"],
    },
    { name: "Text", type: "text", tip: "Tip" },
    { name: "Rating", type: "rating" },
    { name: "Timer", type: "timer" },
  ],
};

/**
 * Parses a stringified template
 * @param templateString A stringified template
 * @returns A template object or an error string
 */
export function parseTemplate(templateString: string): string | Template {
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
