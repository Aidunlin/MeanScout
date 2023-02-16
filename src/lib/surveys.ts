import type { Metric } from "./metrics";

/** List of supported survey file types */
export const surveyFileTypes = ["CSV", "JSON"] as const;
export type SurveyFileType = typeof surveyFileTypes[number];

export type DefaultMetrics = {
  team: string;
  match: number;
  isAbsent: boolean;
};

export type Survey = { name: string; value: any }[];

/**
 * Helper function for creating a survey
 * @param data A reference to `ms` (must be referenced outside of definition)
 * @returns An array of objects, each representing a metric
 */
export function getSurvey(defaultMetrics: DefaultMetrics, customMetrics: Metric[]): Survey {
  return [
    { name: "Team", value: defaultMetrics.team },
    { name: "Match", value: defaultMetrics.match },
    { name: "Absent", value: defaultMetrics.isAbsent },
    ...customMetrics.map((metric) => {
      return { name: metric.config.name, value: metric.value };
    }),
  ];
}

/** Returns a truthy string if the survey is valid, empty string otherwise */
export function validateSurvey(defaultMetrics: DefaultMetrics, teamWhitelist: string[]) {
  if (!/^\d{1,4}[A-Z]?$/.test(defaultMetrics.team)) {
    return "Invalid team value";
  }
  if (teamWhitelist.length && !teamWhitelist.some((team) => team == defaultMetrics.team)) {
    return "Team value not whitelisted";
  }
  if (!/\d{1,3}/.test(`${defaultMetrics.match}`)) {
    return "Invalid match value";
  }
  return "";
}

/**
 * Creates a multiline CSV string for an array of surveys
 * @param surveys An array of surveys (each survey is an array of metric objects)
 */
export function generateCSV(surveys: Survey[]) {
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
export function downloadSurveys(fileType: SurveyFileType, savedSurveys: Survey[]) {
  const anchor = document.createElement("a");
  anchor.href = "data:text/plain;charset=utf-8,";
  if (fileType == "CSV") {
    anchor.href += encodeURIComponent(generateCSV(savedSurveys));
  } else if (fileType == "JSON") {
    anchor.href += encodeURIComponent(JSON.stringify(savedSurveys));
  }
  anchor.download = `surveys.${fileType.toLowerCase()}`;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}
