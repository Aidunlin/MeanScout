<script lang="ts">
  import Container from "./Container.svelte";
  import Icon from "./Icon.svelte";

  let element: HTMLDialogElement;

  export let onOpen: ((element: HTMLDialogElement) => void) | undefined = undefined;
  export let onConfirm: (() => void) | undefined = undefined;

  export function open() {
    onOpen && onOpen(element);
    element.showModal();
  }

  export function close() {
    element.close();
  }
</script>

<slot name="opener" {open} />

<dialog bind:this={element} on:close>
  <slot />
  <Container spaceBetween>
    {#if onConfirm}
      <Container type="button" onClick={() => onConfirm && onConfirm()}>
        <Icon name="check" />
        Confirm
      </Container>
    {/if}
    <Container type="button" onClick={close}>
      <Icon name="xmark" />
      Close
    </Container>
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
