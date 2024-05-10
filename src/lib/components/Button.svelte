<script lang="ts">
  import type { Snippet } from "svelte";
  import type { HTMLButtonAttributes } from "svelte/elements";

  let {
    disabled = false,
    star = false,
    onclick,
    children,
  }: {
    disabled?: boolean;
    star?: boolean;
    onclick?: HTMLButtonAttributes["onclick"];
    children: Snippet;
  } = $props();
</script>

<button {onclick} class:star {disabled}>
  {@render children()}
</button>

<style>
  button {
    background: var(--fg-color);
    display: inline-flex;
    gap: var(--inner-gap);
    justify-content: center;
    padding: var(--inner-gap);
    text-decoration: none;
  }

  button:focus,
  button:hover {
    outline: var(--outline);
  }

  .star {
    padding: var(--inner-gap) 6px;
  }
</style>
