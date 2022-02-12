import { writable } from "svelte/store";

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

export const msData = writable({
  location: "Red Near",
  team: "",
  match: 1,
  isAbsent: false,
  currentTemplate: {},
  customMetrics: [],
  menuVisible: false,
});