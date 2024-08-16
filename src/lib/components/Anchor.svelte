<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    route = "",
    children,
  }: {
    route?: string;
    children: Snippet;
  } = $props();
</script>

<a href="#/{route}">
  {@render children()}
</a>

<style>
  a {
    background: var(--fg-color);
    padding: var(--inner-gap);
    text-decoration: none;
  }

  a:focus,
  a:hover {
    outline: var(--outline);
  }
</style>
