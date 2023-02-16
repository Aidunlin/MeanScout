import { browser } from "$app/environment";
import { writable } from "svelte/store";
import { setTheme, type Location } from "./locations";
import type { Metric } from "./metrics";
import type { DefaultMetrics, Survey, SurveyFileType } from "./surveys";

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

export const currentLocation = localStorageStore<Location>("currentLocation", "Red Near", setTheme);

export const customMetrics = localStorageStore<Metric[]>("customMetrics", []);

export const defaultMetrics = localStorageStore<DefaultMetrics>("defaultMetrics", {
  team: "",
  match: 1,
  isAbsent: false,
});

export const menuVisible = localStorageStore<boolean>("menuVisible", false);

export const savedSurveys = localStorageStore<Survey[]>("savedSurveys", []);

export const surveyFileType = localStorageStore<SurveyFileType>("surveyFileType", "CSV");

export const teamWhitelist = localStorageStore<string[]>("teamWhitelist", []);
