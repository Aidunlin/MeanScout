<script lang="ts">
  import Icon from "./Icon.svelte";
  import type icons from "./icons";

  export let icon: typeof icons[number]["name"] | undefined = undefined;
  export let text = "";
  export let title = text;
</script>

<button on:click class:star={icon?.includes("star")} {title}>
  {#if icon}
    <Icon {icon} />
  {/if}
  {text}
</button>
