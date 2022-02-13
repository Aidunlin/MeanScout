import { writable } from "svelte/store";

export const exampleTemplate = {
  metrics: [
    { name: "Toggle", type: "toggle", group: "Group" },
    { name: "Number", type: "number" },
    { name: "Select", type: "select", values: ["Value 1", "Value 2", "Value 3"] },
    { name: "Text", type: "text", tip: "Tip" },
    { name: "Rating", type: "rating" },
    { name: "Timer", type: "timer" },
  ]
};

export const metricTypes = [
  { name: "toggle", default: false },
  { name: "number", default: 0 },
  { name: "select", default: 0 },
  { name: "text", default: "" },
  { name: "rating", default: 0 },
  { name: "timer", default: 0 },
];

export function getDefaultValue(typeName) {
  return metricTypes.find((type) => type.name == typeName).default ?? null;
}

export const locations = [
  "Red Near",
  "Red Mid",
  "Red Far",
  "Blue Near",
  "Blue Mid",
  "Blue Far",
];

export const surveyTypes = ["CSV", "JSON"];

export const msData = writable({
  location: "Red Near",
  team: "",
  match: 1,
  isAbsent: false,
  currentTemplate: {},
  customMetrics: [],
  menuVisible: false,
});
