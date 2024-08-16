<script lang="ts">
  import type { Snippet } from "svelte";
  import Button from "./Button.svelte";
  import Container from "./Container.svelte";
  import Icon from "./Icon.svelte";

  let {
    onopen = undefined,
    onconfirm = undefined,
    onclose = undefined,
    children,
  }: {
    onopen?: ((element: HTMLDialogElement) => void) | undefined;
    onconfirm?: (() => void) | undefined;
    onclose?: (() => void) | undefined;
    children: Snippet;
  } = $props();

  let element: HTMLDialogElement;

  export function open() {
    onopen && onopen(element);
    element.showModal();
  }

  export function close() {
    element.close();
  }
</script>

<dialog bind:this={element} {onclose}>
  {@render children()}
  <Container spaceBetween>
    {#if onconfirm}
      <Button onclick={() => onconfirm && onconfirm()}>
        <Icon name="check" />
        Confirm
      </Button>
    {/if}
    <Button onclick={close}>
      <Icon name="xmark" />
      Close
    </Button>
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

  dialog:focus-visible {
    outline: none;
  }

  dialog::backdrop {
    background: rgba(0, 0, 0, 0.5);
  }

  dialog[open] {
    display: flex;
  }
</style>
