import { getMetricDefaultValue } from "./metrics";
import type { Survey } from "./surveys";

export type Entry = {
  team: string;
  match: number;
  isAbsent: boolean;
  metrics: any[];
};

export function newEntry(survey: Survey, match?: number): Entry {
  return {
    team: "",
    match: match ?? 1,
    isAbsent: false,
    metrics: survey.configs.map(getMetricDefaultValue),
  };
}

export function resetCustom(survey: Survey, entry?: Entry): Entry {
  if (!entry) return newEntry(survey);
  return {
    team: entry.team,
    match: entry.match,
    isAbsent: entry.isAbsent,
    metrics: survey.configs.map(getMetricDefaultValue),
  };
}

export function validateEntry(survey: Survey, entry: Entry) {
  if (!/^\d{1,4}[A-Z]?$/.test(entry.team)) {
    return "Invalid value for team";
  }
  if (survey.teams.length && !survey.teams.includes(entry.team)) {
    return "Team not whitelisted";
  }
  if (!/\d{1,3}/.test(`${entry.match}`)) {
    return "Invalid value for value";
  }
  survey.configs.forEach((config, i) => {
    if (typeof getMetricDefaultValue(config) !== typeof entry.metrics[i]) {
      return `Invalid value for ${config.name}`;
    }
  });
  return "";
}

export function entryToCSV(entry: Entry) {
  let csv = `${entry.team},${entry.match},${entry.isAbsent}`;
  entry.metrics.forEach((value) => {
    if (typeof value == "string") {
      csv += `,${value.replace(",", "")}`;
    } else {
      csv += `,${value}`;
    }
  });
  return csv;
}
