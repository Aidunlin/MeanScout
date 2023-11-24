<script lang="ts">
  export let title = "";
  export let disableTheme = false;
  export let disabled = false;
  export let star = false;
</script>

<button on:click class:star class:disable-theme={disableTheme} {disabled} {title}>
  <slot />
</button>

<style>
  button {
    background: var(--fg-color);
    cursor: pointer;
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
