<script>
  import { getIcon } from "./global.js";

  /** (required) The name of the icon, as defined in global.js */
  export let icon = "";
  /** (optional) Text accompanying the icon */
  export let text = "";

  /** SVG information for the icon */
  let svg = {
    width: 0,
    path: "",
  };

  // Svelte updates icon data whenever `name` changes
  $: svg = getIcon(icon);
</script>

<button on:click>
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 {svg.width} 512"
    class:text-icon={text}
  >
    <path fill="currentColor" d={svg.path} />
  </svg>{text}
</button>
