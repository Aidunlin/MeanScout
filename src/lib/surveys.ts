import { entryToCSV, type Entry } from "./entries";
import { metricTypes, type MetricConfig } from "./metrics";

export type Survey = {
  name: string;
  configs: MetricConfig[];
  teams: string[];
  entries: Entry[];
};

export function parseSurvey(surveyString: string): string | Survey {
  let result: Survey;
  let error = "";
  try {
    result = JSON.parse(surveyString) as Survey;
  } catch (e) {
    return "\nInvalid survey string";
  }
  if (!result.name) {
    error += "\nSurvey has no name";
  }
  if (!Array.isArray(result.teams ?? [])) {
    error += "\nSurvey has invalid teams";
  }
  if (!result.configs) {
    error += "\nSurvey has no metrics";
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

function surveyEntriesToCSV(survey: Survey) {
  let csv = "Team,Match,Absent";
  survey.configs.forEach((config) => {
    csv += `,${config.name}\n`;
  });
  survey.entries.forEach((entry) => {
    csv += `${entryToCSV(entry)}\n`;
  });
  return csv;
}

export function downloadSurveyEntries(survey: Survey) {
  const anchor = document.createElement("a");
  anchor.download = "surveys.csv";
  anchor.href = "data:text/plain;charset=utf-8," + encodeURIComponent(surveyEntriesToCSV(survey));
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}
