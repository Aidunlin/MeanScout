import { writable } from "svelte/store";

function localStorageStore<T extends string>(key: string, value: T, subscriber?: ((val: T) => void) | undefined) {
  const store = writable<T>((localStorage.getItem(key) as T) || value);
  store.subscribe((val) => localStorage.setItem(key, val));
  if (subscriber) store.subscribe(subscriber);
  return store;
}

// Target setting

export const targets = ["red 1", "red 2", "red 3", "blue 1", "blue 2", "blue 3", "pit"] as const;
export type Target = (typeof targets)[number];

export const targetStore = localStorageStore<Target>("target", "red 1", (target) => {
  if (!targets.includes(target)) {
    target = "red 1";
    localStorage.setItem("target", target);
  }

  switch (target) {
    case "red 1":
    case "red 2":
    case "red 3":
      var newTheme = "red";
      break;
    case "blue 1":
    case "blue 2":
    case "blue 3":
      var newTheme = "blue";
      break;
    case "pit":
      var newTheme = "orange";
      break;
    default:
      var newTheme = "red";
  }

  document.documentElement.style.setProperty("--theme-color", `var(--${newTheme})`);
});

// Mode setting

export const modes = ["admin", "scout"] as const;
export type Mode = (typeof modes)[number];

export const modeStore = localStorageStore<Mode>("mode", "admin");

// Team setting

export const teamStore = localStorageStore<string>("team", "");

// TBA API key setting

export const tbaAuthKeyStore = localStorageStore<string>("tbaAuthKey", "");
