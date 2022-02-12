import { writable } from "svelte/store";
import {
  ToggleMetric,
  NumberMetric,
  SelectMetric,
  TextMetric,
  RatingMetric,
  TimerMetric,
} from "./metrics/metrics.js";

export const exampleTemplate = writable({
  metrics: [
    { name: "Toggle", type: "toggle", group: "Group" },
    { name: "Number", type: "number" },
    { name: "Select", type: "select", values: ["Value 1", "Value 2", "Value 3"] },
    { name: "Text", type: "text", tip: "Tip" },
    { name: "Rating", type: "rating" },
    { name: "Timer", type: "timer" },
  ]
});

export const metricTypes = writable([
  { name: "toggle", metric: ToggleMetric, default: false },
  { name: "number", metric: NumberMetric, default: 0 },
  { name: "select", metric: SelectMetric, default: 0 },
  { name: "text", metric: TextMetric, default: "" },
  { name: "rating", metric: RatingMetric, default: 0 },
  { name: "timer", metric: TimerMetric, default: 0 },
]);

export const msData = writable({
  location: "Red Near",
  team: "",
  match: 1,
  isAbsent: false,
  currentTemplate: {},
  customMetrics: [],
  menuVisible: false,
});