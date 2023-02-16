<script lang="ts" context="module">
  /** List of supported survey file types */
  export const fileFormats = ["CSV", "JSON"] as const;
  export type FileFormat = typeof fileFormats[number];

  /** List of robot locations */
  export const locations = ["Red Near", "Red Mid", "Red Far", "Blue Near", "Blue Mid", "Blue Far"] as const;
  export type Location = typeof locations[number];

  /** List of metric types */
  export const metricTypes = ["toggle", "number", "select", "text", "rating", "timer"] as const;
  export type MetricType = typeof metricTypes[number];

  type BaseMetric = {
    name: string;
    type: MetricType;
    group?: string;
  };

  type UniqueMetric =
    | { type: "toggle" }
    | { type: "number" }
    | { type: "select"; values: string[] }
    | { type: "text"; tip?: string }
    | { type: "rating" }
    | { type: "timer" };

  export type MetricConfig = BaseMetric & UniqueMetric;

  export type Metric = {
    config: MetricConfig;
    value: any;
  };

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

  export type DefaultMetrics = {
    team: string;
    match: number;
    isAbsent: boolean;
  };

  export type Survey = { name: string; value: any }[];

  /**
   * Helper function for getting default metric values
   * @param type The metric's type
   * @returns The default value defined in `metricDefaults` or `undefined`
   */
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

  export function createMetricFromConfig(config: MetricConfig): Metric {
    return { config, value: getMetricDefaultValue(config) };
  }

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
</script>
