<script>
  import { ms } from "./Global.svelte";

  function toggleMenu() {
    $ms.menuVisible = !$ms.menuVisible;
    if ($ms.menuVisible) localStorage.setItem("menuVisible", true);
    else localStorage.removeItem("menuVisible");
  }

  function load() {
    $ms.menuVisible = localStorage.getItem("menuVisible") ?? false;
  }
</script>

<svelte:window on:load={load} />

<div class="flex space-between spaced bg">
  <button id="menu-toggle-btn" on:click={toggleMenu}>
    <img class="text-icon" id="logo" src="./logo.svg" alt />MeanScout
  </button>
  <span id="location-text">{$ms.location}</span>
</div>
