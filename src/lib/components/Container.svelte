<script lang="ts">
  export let direction: "row" | "column" = "row";
  export let padding: "none" | "small" | "large" = "none";
  export let align: "normal" | "center" | "start" | "end" = "normal";
  export let spaceBetween = false;
  export let gap: "none" | "small" | "large" = "large";
  export let maxWidth = false;
  export let bg = false;
</script>

<div
  class="direction-{direction} padding-{padding} align-{align} gap-{gap}"
  class:space-between={spaceBetween}
  class:max-width={maxWidth}
  class:bg
>
  <slot />
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
