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
