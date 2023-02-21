<script lang="ts">
  import type icons from "$lib/icons";
  import Icon from "./Icon.svelte";

  export let icon: typeof icons[number]["name"] | undefined = undefined;
  export let text = "";
  export let title = text;
</script>

<button on:click class:star={icon?.includes("star")} {title}>
  {#if icon}
    <Icon {icon} />
  {/if}
  {#if text}
    <span>{text}</span>
  {/if}
</button>
