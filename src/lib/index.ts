import type Dialog from "./components/Dialog.svelte";

export const metricTypes = ["team", "match", "toggle", "number", "select", "text", "rating", "timer", "group"] as const;
export type MetricType = (typeof metricTypes)[number];

type BaseConfig<T extends MetricType> = {
  name: string;
  type: T;
};

type TeamConfig = BaseConfig<"team">;
type MatchConfig = BaseConfig<"match">;
type ToggleConfig = BaseConfig<"toggle">;
type NumberConfig = BaseConfig<"number"> & { allowNegative?: boolean };
type SelectConfig = BaseConfig<"select"> & { values: string[] };
type TextConfig = BaseConfig<"text"> & { long?: boolean; tip?: string };
type RatingConfig = BaseConfig<"rating">;
type TimerConfig = BaseConfig<"timer">;
type GroupConfig = BaseConfig<"group"> & { configs: Exclude<MetricConfig, GroupConfig>[] };

export type MetricConfig =
  | TeamConfig
  | MatchConfig
  | ToggleConfig
  | NumberConfig
  | SelectConfig
  | TextConfig
  | RatingConfig
  | TimerConfig
  | GroupConfig;

export type Survey = {
  name: string;
  configs: MetricConfig[];
  teams: string[];
  created: Date;
  modified: Date;
};

export type Entry = {
  surveyId: number;
  values: any[];
  created: Date;
  modified: Date;
};

export type IDBRecord<T> = T & { id: number };

export type DialogDataType<T> = { dialog?: Dialog; data: T };

export function getMetricDefaultValue(config: Exclude<MetricConfig, GroupConfig>) {
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
      const unhandledType: never = config;
      throw new Error(`Unhandled type for config ${unhandledType}`);
  }
}

export function flattenConfigs(configs: MetricConfig[]) {
  return configs
    .map((config) => {
      if (config.type == "group") {
        return config.configs;
      } else {
        return config;
      }
    })
    .flat();
}
