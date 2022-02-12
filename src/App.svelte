<script>
  import MenuBar from "./MenuBar.svelte";
  import Menu from "./Menu.svelte";
  import Main from "./Main.svelte";

  function load() {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./sw.js");
    }
    document.body.classList.remove("hide");
  }
</script>

<svelte:window on:load={load} />

<MenuBar />
<Menu />
<Main />
