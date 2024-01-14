import { writable } from "svelte/store";

export const tbaKeyStore = writable<string>((localStorage.getItem("tbaKey") as string) || "");
tbaKeyStore.subscribe((tbaKey) => {
  localStorage.setItem("tbaKey", tbaKey);
});

const API_URL = "https://www.thebluealliance.com/api/v3";

export function fetchTBA(endpoint: string, tbaKey: string) {
  return fetch(`${API_URL}${endpoint}`, {
    headers: [["X-TBA-Auth-Key", tbaKey]],
  });
}
