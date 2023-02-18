import { metricTypes, type MetricConfig } from "./metrics";

export type Template = {
  name: string;
  configs: MetricConfig[];
  teams: string[];
};

export const exampleTemplate: Template = {
  name: "Example",
  configs: [
    { name: "Toggle", type: "toggle", group: "Example" },
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
  teams: [],
};

export function parseTemplate(templateString: string): string | Template {
  let result: Template;
  let error = "";
  try {
    result = JSON.parse(templateString) as Template;
  } catch (e) {
    return "Invalid template string";
  }
  if (!result.name) {
    error += "\nTemplate has no name";
  }
  if (!Array.isArray(result.teams ?? [])) {
    error += "\nTemplate has invalid teams";
  }
  if (!result.configs) {
    error += "\nTemplate has no metrics";
  } else {
    result.configs.forEach((metric, i) => {
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
