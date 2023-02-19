import { browser } from "$app/environment";
import { derived, writable } from "svelte/store";
import type { Entry } from "./entries";
import type { Survey } from "./surveys";

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
    localStorage[key] = JSON.stringify(value);
    if (subscriber) subscriber(value);
  });
  return store;
}

export const surveys = localStorageStore<Survey[]>("surveys", []);
export const currentSurveyName = localStorageStore<string>("currentSurvey", "");

export const currentSurveyIndex = derived([surveys, currentSurveyName], ([$surveys, $surveyName]) => {
  return $surveys.map((survey) => survey.name).indexOf($surveyName);
});

export const currentEntry = localStorageStore<Entry>("currentEntry", {
  team: "",
  match: 1,
  isAbsent: false,
  metrics: [],
});
