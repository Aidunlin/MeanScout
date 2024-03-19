import { writable } from "svelte/store";

export const modes = ["admin", "scout"] as const;
export type Mode = (typeof modes)[number];

export const modeStore = writable<Mode>((localStorage.getItem("mode") as Mode) || "admin");
modeStore.subscribe((mode) => {
    localStorage.setItem("mode", mode);
})