import { writable } from "svelte/store";

export const allianceTargets = ["red", "blue"] as const;
export type AllianceTarget = (typeof allianceTargets)[number];

export const redTeamTargets = ["red 1", "red 2", "red 3"] as const;
export type RedTeamTarget = (typeof redTeamTargets)[number];

export const blueTeamTargets = ["blue 1", "blue 2", "blue 3"] as const;
export type BlueTeam = (typeof blueTeamTargets)[number];

export const otherTargets = ["pit"] as const;
export type OtherTarget = (typeof otherTargets)[number];

export const targets = [...allianceTargets, ...redTeamTargets, ...blueTeamTargets, ...otherTargets] as const;
export type Target = (typeof targets)[number];

export const metricTypes = ["team", "match", "toggle", "number", "select", "text", "rating", "timer"] as const;
export type MetricType = (typeof metricTypes)[number];

type BaseConfig = {
  name: string;
  type: MetricType;
  group?: string;
  required?: boolean;
};

interface TeamConfig extends BaseConfig {
  type: "team";
}

interface MatchConfig extends BaseConfig {
  type: "match";
}

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
  team: TeamConfig;
  match: MatchConfig;
  toggle: ToggleConfig;
  number: NumberConfig;
  select: SelectConfig;
  text: TextConfig;
  rating: RatingConfig;
  timer: TimerConfig;
}

export type MetricConfig = MetricConfigTypeMap[MetricType];

export type Entry = any[];

export type Survey = {
  name: string;
  configs: MetricConfig[];
  teams: string[];
  entries: Entry[];
};

function localStorageStore<T>(key: string, start: T, subscriber?: (val: T) => void) {
  try {
    if (typeof start == "string") {
      start = localStorage[key] ?? start;
    } else {
      start = JSON.parse(localStorage[key]);
    }
  } finally {
    let store = writable(start);
    store.subscribe((value) => {
      if (typeof value == "string") {
        localStorage[key] = value;
      } else {
        localStorage[key] = JSON.stringify(value);
      }
      if (subscriber) subscriber(value);
    });
    return store;
  }
}

export const surveys = localStorageStore<Survey[]>("surveys", []);
export const target = localStorageStore<Target>("target", "red", (target) => {
  let newTheme = target.split(" ")[0];
  if (target == "pit") newTheme = "yellow";
  document.documentElement.style.setProperty("--theme-color", `var(--${newTheme})`);
});

export function getMetricDefaultValue(config: MetricConfig) {
  switch (config.type) {
    case "team":
      return "";
    case "match":
      return 1;
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
