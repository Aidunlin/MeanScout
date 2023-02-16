/** List of robot locations */
export const locations = ["Red Near", "Red Mid", "Red Far", "Blue Near", "Blue Mid", "Blue Far"] as const;
export type Location = typeof locations[number];

export function setTheme(location: Location) {
  let newTheme = "";
  if (location.toLowerCase().includes("red")) {
    newTheme = "red";
  } else if (location.toLowerCase().includes("blue")) {
    newTheme = "blue";
  }
  document.documentElement.style.setProperty("--theme-color", `var(--${newTheme})`);
}
