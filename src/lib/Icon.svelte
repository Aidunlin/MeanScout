<script lang="ts">
  import icons from "$lib/icons";

  export let icon: typeof icons[number]["name"];

  $: svg = icons.find((i) => i.name == icon);
</script>

{#if svg}
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {svg.width} 512">
    <path fill="currentColor" d={svg.path} />
  </svg>
{/if}
