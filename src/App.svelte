<script>
  import Icon from "./Icon.svelte";
  import Menu from "./Menu.svelte";

  if ("serviceWorker" in navigator) {
    window.onload = () => {
      navigator.serviceWorker.register("./sw.js");
    };
  }

  let scoutLocation = "Red Near";
  let matchCount = 1;
  let isAbsent = false;

  let menuVisible = false;

  /** Toggles the options menu */
  function toggleMenu() {
    menuVisible = !menuVisible;
  }

  /** Toggles whether the team is absent */
  function toggleAbsent() {
    isAbsent = !isAbsent;
  }

  /** Sets a new scout location */
  function setLocation(event) {
    scoutLocation = event.detail.location;
    let newTheme = "red";
    if (/blue/.test(scoutLocation.toLowerCase())) newTheme = "blue";
    document.documentElement.style.setProperty(
      "--theme-color",
      `var(--${newTheme})`
    );
    localStorage.location = scoutLocation;
  }
</script>

<div class="flex spaced" id="menu-bar">
  <button id="menu-toggle-btn" on:click={toggleMenu}>
    <img class="text-icon" id="logo" src="./logo.svg" alt />MeanScout
  </button>
  <span id="location-text">{scoutLocation}</span>
</div>

<Menu on:locationUpdated={setLocation} bind:visible={menuVisible} />

<div class="flex" id="main">
  <div class="flex spaced" id="metrics-default">
    <div>
      Team
      <input id="metric-team" list="teams" maxlength="5" />
      <datalist id="teams-list" />
    </div>
    <div>
      Match
      <input id="metric-match" type="number" bind:value="{matchCount}" pattern="[0-9]*" />
    </div>
    <div>
      <button id="metric-absent" on:click={toggleAbsent}>
        <Icon name={isAbsent ? "square-checked" : "square-empty"} />
        Absent
      </button>
    </div>
  </div>

  <div class="flex spaced" id="metrics-custom" />

  <span class="group">Survey</span>
  <div class="flex spaced">
    <button id="survey-save-btn">
      <Icon name="save" />
      Save
    </button>
    <button id="survey-reset-btn">
      <Icon name="reset" />
      Reset
    </button>
  </div>
</div>
