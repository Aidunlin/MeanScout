<script>
  import { getIcon } from "./global.js";

  export let name = "";
  export let text = "";

  let icon;

  $: icon = getIcon(name);
</script>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 {icon.width} 512"
  class:text-icon={text}
>
  <path fill="currentColor" d={icon.path} />
</svg>{text}
