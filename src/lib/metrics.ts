export const metricTypes = ["toggle", "number", "select", "text", "rating", "timer"] as const;
export type MetricType = typeof metricTypes[number];

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

export type Metric = {
  config: MetricConfig;
  value: any;
};

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

export function configToMetric(config: MetricConfig): Metric {
  return { config, value: getMetricDefaultValue(config) };
}
