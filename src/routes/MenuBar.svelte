<script lang="ts">
  import { onMount } from "svelte";
  import { ms } from "./Global.svelte";

  function toggleMenu() {
    $ms.menuVisible = !$ms.menuVisible;
    if ($ms.menuVisible) {
      localStorage.setItem("menuVisible", "true");
    } else {
      localStorage.removeItem("menuVisible");
    }
  }

  onMount(() => {
    $ms.menuVisible = !!localStorage.getItem("menuVisible");
  });
</script>

<div class="flex space-between spaced bg extend-bg">
  <button id="menu-toggle-btn" on:click={toggleMenu}>
    <img class="text-icon" id="logo" src="./logo.png" alt="" />MeanScout
  </button>
  <span id="location-text">{$ms.location}</span>
</div>
