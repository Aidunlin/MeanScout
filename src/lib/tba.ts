import { writable } from "svelte/store";

export const tbaKeyStore = writable<string>((localStorage.getItem("tbaKey") as string) || "");
tbaKeyStore.subscribe((tbaKey) => {
  localStorage.setItem("tbaKey", tbaKey);
});

const API_URL = "https://www.thebluealliance.com/api/v3";

export async function fetchTBA(endpoint: string, tbaKey: string) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: [["X-TBA-Auth-Key", tbaKey]],
  });

  let data = await response.json();

  if (response.status == 200) {
    return { status: "success" as const, data };
  } else if (response.status == 401) {
    return { status: "unauthorized" as const, error: data.Error };
  } else if (response.status == 404) {
    return { status: "not found" as const };
  } else {
    return { status: "error" as const };
  }
}
