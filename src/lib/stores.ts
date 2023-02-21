import { writable } from "svelte/store";
import type { Survey } from "./surveys";

export function localStorageStore<T>(key: string, start: T, subscriber?: (val: T) => void) {
  try {
    start = JSON.parse(localStorage[key]);
  } catch (error) {
    console.log(`Could not get value from localStorage.${key}, using default`);
  }
  let store = writable(start);
  store.subscribe((value) => {
    localStorage[key] = JSON.stringify(value);
    if (subscriber) subscriber(value);
  });
  return store;
}

export const surveys = localStorageStore<Survey[]>("surveys", []);
