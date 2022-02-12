<script>
  import { msData } from "./stores.js";

  function toggleMenu() {
    $msData.menuVisible = !$msData.menuVisible;
  }
</script>

<div class="flex spaced" id="menu-bar">
  <button id="menu-toggle-btn" on:click={toggleMenu}>
    <img class="text-icon" id="logo" src="./logo.svg" alt />MeanScout
  </button>
  <span id="location-text">{$msData.location}</span>
</div>
