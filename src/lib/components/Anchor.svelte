<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    route = "",
    title = "",
    children,
  }: {
    route?: string;
    title?: string;
    children: Snippet;
  } = $props();
</script>

<a href="#/{route}" {title}>
  {@render children()}
</a>

<style>
  a {
    background: var(--fg-color);
    gap: var(--inner-gap);
    justify-content: center;
    padding: var(--inner-gap);
    text-decoration: none;
  }

  a:focus,
  a:hover {
    outline: var(--outline);
  }
</style>
