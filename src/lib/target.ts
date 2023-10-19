import { writable } from "svelte/store";

export const targets = ["red", "blue", "red 1", "red 2", "red 3", "blue 1", "blue 2", "blue 3", "pit"] as const;
export type Target = (typeof targets)[number];

export const targetStore = writable<Target>("red");
targetStore.subscribe((target) => {
  const newTheme = target == "pit" ? "orange" : target.split(" ")[0];
  document.documentElement.style.setProperty("--theme-color", `var(--${newTheme})`);
});
