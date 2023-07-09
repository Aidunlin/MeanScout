import { writable } from "svelte/store";

export const locations = ["Red 1", "Red 2", "Red 3", "Blue 1", "Blue 2", "Blue 3"] as const;
type Location = (typeof locations)[number];

export const metricTypes = ["toggle", "number", "select", "text", "rating", "timer"] as const;
export type MetricType = (typeof metricTypes)[number];

type BaseConfig = {
  name: string;
  type: MetricType;
  group?: string;
};

interface ToggleConfig extends BaseConfig {
  type: "toggle";
}

interface NumberConfig extends BaseConfig {
  type: "number";
}

interface SelectConfig extends BaseConfig {
  type: "select";
  values: string[];
}

interface TextConfig extends BaseConfig {
  type: "text";
  long?: boolean;
  tip?: string;
}

interface RatingConfig extends BaseConfig {
  type: "rating";
}

interface TimerConfig extends BaseConfig {
  type: "timer";
}

interface MetricConfigTypeMap {
  toggle: ToggleConfig;
  number: NumberConfig;
  select: SelectConfig;
  text: TextConfig;
  rating: RatingConfig;
  timer: TimerConfig;
}

export type MetricConfig = MetricConfigTypeMap[MetricType];

export type Entry = {
  team: string;
  match: number;
  isAbsent: boolean;
  metrics: any[];
};

export type Survey = {
  name: string;
  configs: MetricConfig[];
  teams: string[];
  entries: Entry[];
};

class Indexes {
  private value: { survey?: number; entry: undefined } | { survey: number; entry: number } = {
    survey: undefined,
    entry: undefined,
  };

  get survey() {
    return this.value.survey;
  }

  set survey(index) {
    this.value = { survey: index, entry: undefined };
  }

  get entry() {
    return this.value.entry;
  }

  set entry(index) {
    if (this.value.survey != undefined) {
      this.value.entry = index;
    } else {
      this.value.entry = undefined;
    }
  }
}

function localStorageStore<T>(key: string, start: T, subscriber?: (val: T) => void) {
  try {
    start = JSON.parse(localStorage[key]);
  } finally {
    let store = writable(start);
    store.subscribe((value) => {
      localStorage[key] = JSON.stringify(value);
      if (subscriber) subscriber(value);
    });
    return store;
  }
}

export const surveys = localStorageStore<Survey[]>("surveys", []);
export const indexes = localStorageStore<Indexes>("indexes", new Indexes());
export const surveySubPage = localStorageStore<"entries" | "configs" | "options">("surveySubPage", "entries");
export const location = localStorageStore<Location>("location", "Red 1", (location) => {
  let newTheme = location.split(" ")[0].toLowerCase();
  document.documentElement.style.setProperty("--theme-color", `var(--${newTheme})`);
});

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

function entryToCSV(entry: Entry) {
  let csv = `${entry.team},${entry.match},${entry.isAbsent}`;
  entry.metrics.forEach((value) => {
    if (typeof value == "string") {
      csv += `,${value.replaceAll(",", "").replaceAll("\n", ". ")}`;
    } else {
      csv += `,${value}`;
    }
  });
  return csv;
}

function surveyEntriesToCSV(survey: Survey) {
  let csv = "Team,Match,Absent";
  survey.configs.forEach((config) => {
    csv += `,${config.name}`;
  });
  csv += "\n";
  survey.entries.forEach((entry) => {
    if (entry.team && entry.match) {
      csv += `${entryToCSV(entry)}\n`;
    }
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

export function getMetricDefaultValue(config: MetricConfig) {
  switch (config.type) {
    case "toggle":
      return false;
    case "number":
      return 0;
    case "select":
      return config.values[0];
    case "text":
      return "";
    case "rating":
      return 0;
    case "timer":
      return 0;
    default:
      return undefined;
  }
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
  entry.metrics.forEach((value, i) => {
    if (typeof value == "undefined" || typeof value !== typeof getMetricDefaultValue(survey.configs[i])) {
      return `Invalid value for ${survey.configs[i].name}`;
    }
  });
  return "";
}
