<script lang="ts">
  import { getIcon } from "$lib/icons";

  export let icon = "";
  export let text = "";
  export let title: string | undefined = undefined;

  let svg = { width: 0, path: "" };

  $: svg = getIcon(icon);
</script>

<button on:click class:star={icon.includes("star")} {title}>
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {svg.width} 512" class:text-icon={text}>
    <path fill="currentColor" d={svg.path} />
  </svg>{text}
</button>
