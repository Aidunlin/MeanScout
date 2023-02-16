<script lang="ts" context="module">
  import type { MetricConfig } from "./metrics";

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
</script>
