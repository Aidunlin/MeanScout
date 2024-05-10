<script lang="ts">
  import type { Snippet } from "svelte";

  let {
    direction = "row",
    padding = "none",
    align = "normal",
    spaceBetween = false,
    gap = "large",
    maxWidth = false,
    bg = false,
    children,
  }: {
    direction?: "row" | "column";
    padding?: "none" | "small" | "large";
    align?: "normal" | "center" | "start" | "end";
    spaceBetween?: boolean;
    gap?: "none" | "small" | "large";
    maxWidth?: boolean;
    bg?: boolean;
    children: Snippet;
  } = $props();
</script>

<div
  class="direction-{direction} padding-{padding} align-{align} gap-{gap}"
  class:space-between={spaceBetween}
  class:max-width={maxWidth}
  class:bg
>
  {@render children()}
</div>

<style>
  div {
    display: flex;
    flex-wrap: wrap;
  }

  .direction-row {
    flex-direction: row;
  }

  .direction-column {
    flex-direction: column;
  }

  .padding-none {
    padding: 0;
  }

  .padding-small {
    padding: var(--inner-gap);
  }

  .padding-large {
    padding: var(--outer-gap);
  }

  .align-normal {
    align-items: normal;
  }

  .align-center {
    align-items: center;
  }

  .align-start {
    align-items: flex-start;
  }

  .align-end {
    align-items: flex-end;
  }

  .space-between {
    justify-content: space-between;
  }

  .gap-none {
    gap: 0;
  }

  .gap-small {
    gap: var(--inner-gap);
  }

  .gap-large {
    gap: var(--outer-gap);
  }

  .max-width {
    width: 100%;
  }

  .bg {
    background: var(--fg-color);
  }
</style>
