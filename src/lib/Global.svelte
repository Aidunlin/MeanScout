<script lang="ts" context="module">
  import type { MetricConfig, Metric } from "./metrics";

  /** List of supported survey file types */
  export const fileFormats = ["CSV", "JSON"] as const;
  export type FileFormat = typeof fileFormats[number];

  /** List of robot locations */
  export const locations = ["Red Near", "Red Mid", "Red Far", "Blue Near", "Blue Mid", "Blue Far"] as const;
  export type Location = typeof locations[number];

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
