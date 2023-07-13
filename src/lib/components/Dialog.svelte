<script lang="ts">
  import type { ComponentProps } from "svelte";
  import Button from "./Button.svelte";
  import Container from "./Container.svelte";

  let element: HTMLDialogElement;

  export let openButton: ComponentProps<Button>;
  export let onOpen: (() => void) | undefined = undefined;
  export let onConfirm: (() => boolean) | undefined = undefined;
</script>

<Button
  {...openButton}
  on:click={() => {
    if (onOpen) onOpen();
    element.showModal();
  }}
/>
<dialog bind:this={element} on:close>
  <slot />
  <Container spaceBetween>
    {#if onConfirm}
      <Button
        iconName="check"
        title="Confirm"
        on:click={() => {
          if (onConfirm && onConfirm()) element.close();
        }}
      />
    {/if}
    <Button iconName="xmark" title="Close" on:click={() => element.close()} />
  </Container>
</dialog>
