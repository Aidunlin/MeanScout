<script lang="ts">
  import type { ComponentProps } from "svelte";
  import Button from "./Button.svelte";
  import Container from "./Container.svelte";

  let element: HTMLDialogElement;

  export let openButton: ComponentProps<Button>;
  export let onOpen: (() => void) | undefined = undefined;
  export let onConfirm: (() => boolean | void) | undefined = undefined;
</script>

<Button
  {...openButton}
  on:click={() => {
    onOpen && onOpen();
    element.showModal();
  }}
/>

<dialog bind:this={element} on:close>
  <slot />
  <Container spaceBetween>
    {#if onConfirm}
      <Button iconName="check" title="Confirm" on:click={() => onConfirm && onConfirm() !== false && element.close()} />
    {/if}
    <Button iconName="xmark" title="Close" on:click={() => element.close()} />
  </Container>
</dialog>

<style>
  dialog {
    background: rgb(25, 25, 25);
    flex-direction: column;
    gap: var(--outer-gap);
    max-height: 100dvh;
    padding: var(--outer-gap);
    width: min(100dvw, 540px);
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }

  dialog[open] {
    display: flex;
  }
</style>
