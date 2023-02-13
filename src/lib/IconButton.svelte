<script>
  import { getIcon } from "./Global.svelte";

  /** (required) The name of the icon, as defined in Global.svelte */
  export let icon = "";
  /** (optional) Text accompanying the icon */
  export let text = "";

  /** SVG info for the icon */
  let svg = { width: 0, path: "" };

  // Svelte updates svg info whenever `icon` changes
  $: svg = getIcon(icon);
</script>

<button on:click class:star={icon.includes("star")}>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 {svg.width} 512"
    class:text-icon={text}
  >
    <path fill="currentColor" d={svg.path} />
  </svg>{text}
</button>
