<script>
  import { getIcon } from "./global.js";

  /** (required) The name of the icon, as defined in global.js */
  export let name = "";
  /** (optional) Text accompanying the icon */
  export let text = "";

  /** SVG information for the icon */
  let icon = {
    width: 0,
    path: "",
  };

  // Svelte updates icon data whenever `name` changes
  $: icon = getIcon(name);
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 {icon.width} 512"
  class:text-icon={text}
>
  <path fill="currentColor" d={icon.path} />
</svg>{text}
