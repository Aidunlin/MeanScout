import { entryToCSV, type Entry } from "./entries";
import type { MetricConfig } from "./metrics";
import type { Template } from "./templates";

export type Survey = {
  name: string;
  configs: MetricConfig[];
  teams: string[];
  entries: Entry[];
};

export function templateToSurvey(template: Template): Survey {
  return { name: template.name, configs: template.configs, teams: template.teams, entries: [] };
}

export function surveyToTemplate(survey: Survey): Template {
  return {
    name: survey.name,
    configs: survey.configs,
    teams: survey.teams,
  };
}

function surveyToCSV(survey: Survey) {
  let csv = "Team,Match,Absent";
  survey.configs.forEach((config) => {
    csv += `,${config.name}\n`;
  });
  survey.entries.forEach((entry) => {
    csv += `${entryToCSV(entry)}\n`;
  });
  return csv;
}

export function downloadSurvey(survey: Survey) {
  const anchor = document.createElement("a");
  anchor.download = "surveys.csv";
  anchor.href = "data:text/plain;charset=utf-8," + encodeURIComponent(surveyToCSV(survey));
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
}
