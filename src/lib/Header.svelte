<script lang="ts">
  import { localStorageStore } from "./stores";

  const locations = ["Red Near", "Red Mid", "Red Far", "Blue Near", "Blue Mid", "Blue Far"] as const;
  type Location = typeof locations[number];
  const location = localStorageStore<Location>("location", "Red Near", setTheme);

  function setTheme(location: Location) {
    let newTheme = location.split(" ")[0].toLowerCase();
    document.documentElement.style.setProperty("--theme-color", `var(--${newTheme})`);
  }
</script>

<header>
  <div class="flex spaced-inner">
    <slot>
      <img id="logo" src="./logo.svg" alt="" />
      <h1>MeanScout</h1>
    </slot>
  </div>
  <div class="flex">
    <select bind:value={$location} title="Location">
      {#each Object.values(locations) as location}
        <option>{location}</option>
      {/each}
    </select>
  </div>
</header>
