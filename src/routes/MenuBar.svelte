<script lang="ts">
  import { menuVisible, currentLocation } from "$lib/stores";
</script>

<div class="flex space-between spaced bg extend-bg">
  <button id="menu-toggle-btn" on:click={() => ($menuVisible = !$menuVisible)}>
    <img class="text-icon" id="logo" src="./logo.png" alt="" />MeanScout
  </button>
  <span id="location-text">{$currentLocation}</span>
</div>
