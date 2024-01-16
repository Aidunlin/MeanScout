<script lang="ts">
  export let type: "container" | "link" | "button" = "container";
  export let link: string | undefined = undefined;
  export let onClick: (() => void) | undefined = undefined;
  export let disabled = false;
  export let title = "";

  export let direction: "row" | "column" | undefined = undefined;
  export let padding: "none" | "small" | "large" | undefined = undefined;
  export let align: "normal" | "center" | "start" | "end" | undefined = undefined;
  export let spaceBetween = false;
  export let gap: "large" | "small" | "none" | undefined = undefined;
  export let maxWidth = false;
  export let bg = false;
</script>

{#if type == "link"}
  <a
    href="#/{link}"
    {title}
    class="link direction-{direction ?? 'row'} padding-{padding ?? 'small'} align-{align ?? 'normal'} gap-{gap ??
      'small'}"
    class:space-between={spaceBetween}
    class:max-width={maxWidth}
    class:bg
  >
    <slot />
  </a>
{:else if type == "button"}
  <button
    on:click={onClick}
    {disabled}
    {title}
    class="button direction-{direction ?? 'row'} padding-{padding ?? 'small'} align-{align ?? 'normal'} gap-{gap ??
      'small'}"
    class:space-between={spaceBetween}
    class:max-width={maxWidth}
    class:bg
  >
    <slot />
  </button>
{:else}
  <div
    class="container direction-{direction ?? 'row'} padding-{padding ?? 'none'} align-{align ?? 'normal'} gap-{gap ??
      'large'}"
    class:space-between={spaceBetween}
    class:max-width={maxWidth}
    class:bg
  >
    <slot />
  </div>
{/if}

<style>
  .container,
  .link,
  .button {
    display: flex;
    flex-wrap: wrap;
  }

  .link,
  .button {
    background: var(--fg-color);
    text-decoration: none;
  }

  .link:focus,
  .link:hover,
  .button:focus,
  .button:hover {
    outline: var(--outline);
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
