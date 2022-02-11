<script>
  export let menuVisible = false;
  export let scoutLocation = "Red Near";

  function toggleMenu() {
    menuVisible = !menuVisible;
  }
</script>

<div class="flex spaced" id="menu-bar">
  <button id="menu-toggle-btn" on:click={toggleMenu}>
    <img class="text-icon" id="logo" src="./logo.svg" alt />MeanScout
  </button>
  <span id="location-text">{scoutLocation}</span>
</div>
