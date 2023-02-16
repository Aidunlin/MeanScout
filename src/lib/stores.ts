import { browser } from "$app/environment";
import { writable } from "svelte/store";
import type { Metric } from "./metrics";
import type { Location, DefaultMetrics, Survey } from "./Global.svelte";

/**
 * Creates a writable store that automatically synchronizes with `localStorage`.
 *
 * @param key The localStorage key to read/write.
 * @param start The initial value for the store and localStorage.
 * @param subscriber An optional callback for additional subscriber logic.
 */
export function localStorageStore<T>(key: string, start: T, subscriber?: (val: T) => void) {
  try {
    if (browser) {
      start = JSON.parse(localStorage[key]);
    }
  } catch (error) {
    console.log(`Could not get value from localStorage.${key}, using default`);
  }
  let store = writable(start);
  store.subscribe((value) => {
    if (!browser) return;
    if (!value) value = start;
    localStorage[key] = JSON.stringify(value);
    if (subscriber) subscriber(value);
  });
  return store;
}

export const currentLocation = localStorageStore<Location>("currentLocation", "Red Near", (val) => {
  let newTheme = "";
  if (val.toLowerCase().includes("red")) {
    newTheme = "red";
  } else if (val.toLowerCase().includes("blue")) {
    newTheme = "blue";
  }
  document.documentElement.style.setProperty("--theme-color", `var(--${newTheme})`);
});

export const customMetrics = localStorageStore<Metric[]>("customMetrics", []);

export const defaultMetrics = localStorageStore<DefaultMetrics>("defaultMetrics", {
  team: "",
  match: 1,
  isAbsent: false,
});

export const menuVisible = localStorageStore<boolean>("menuVisible", false);

export const savedSurveys = localStorageStore<Survey[]>("savedSurveys", []);

export const teamWhitelist = localStorageStore<string[]>("teamWhitelist", []);
