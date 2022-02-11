<script>
  import MenuBar from "./MenuBar.svelte";
  import Menu from "./Menu.svelte";
  import Main from "./Main.svelte";

  if ("serviceWorker" in navigator) {
    window.onload = () => {
      navigator.serviceWorker.register("./sw.js");
    };
  }

  let scoutLocation = "Red Near";
  let matchCount = 1;
  let isAbsent = false;
  let menuVisible = false;

  /** Sets a new scout location */
  function setLocation(location) {
    scoutLocation = location;
    let newTheme = "red";
    if (/blue/.test(scoutLocation.toLowerCase())) newTheme = "blue";
    document.documentElement.style.setProperty(
      "--theme-color",
      `var(--${newTheme})`
    );
    localStorage.location = scoutLocation;
  }

  /** Handler for Menu location update */
  function locationUpdated(event) {
    setLocation(event.detail.location);
  }

  function load() {
    if (localStorage.location) {
      setLocation(localStorage.location);
    }
  }
</script>

<svelte:window on:load={load} />

<MenuBar bind:menuVisible bind:scoutLocation />
<Menu
  on:locationUpdated={locationUpdated}
  bind:scoutLocation
  bind:menuVisible
/>
<Main bind:isAbsent bind:matchCount />
