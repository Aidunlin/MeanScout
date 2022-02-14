<script>
  import { ms } from "./global.js";

  /** D... do I really need to explain this one? */
  function toggleMenu() {
    $ms.menuVisible = !$ms.menuVisible;
  }
</script>

<div class="flex space-between spaced bg">
  <button id="menu-toggle-btn" on:click={toggleMenu}>
    <img class="text-icon" id="logo" src="./logo.svg" alt />MeanScout
  </button>
  <span id="location-text">{$ms.location}</span>
</div>
