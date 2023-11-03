<script lang="ts">
  export let column = false;
  export let padding = false;
  export let spaceBetween = false;
  export let alignEnd = false;
  export let noGap = false;
  export let maxWidth = false;
  export let bg = false;
</script>

<div
  class:flex-row={!column}
  class:flex-column={column}
  class:padding
  class:space-between={spaceBetween}
  class:align-end={alignEnd}
  class:no-gap={noGap}
  class:max-width={maxWidth}
  class:bg
>
  <slot />
</div>

<style>
  div {
    display: flex;
    gap: var(--outer-gap);
    flex-wrap: wrap;
  }

  .flex-row {
    align-items: center;
    flex-direction: row;
  }

  .flex-column {
    flex-direction: column;
  }

  .padding {
    padding: var(--outer-gap);
  }

  .space-between {
    justify-content: space-between;
  }

  .align-end {
    align-items: flex-end;
  }

  .no-gap {
    gap: 0;
  }

  .max-width {
    width: 100%;
  }

  .bg {
    background: var(--fg-color);
  }
</style>
