<script lang="ts">
  import Button from "./Button.svelte";
  import Container from "./Container.svelte";

  export let visible = false;
  export let title = "";
</script>

{#if visible}
  <div class="dialog" on:mousedown={() => (visible = false)}>
    <div on:mousedown={(e) => e.stopPropagation()}>
      <Container column padding>
        {title}
        <slot />
        <Container spaceBetween>
          <slot name="buttons" />
          <Button iconName="xmark" title="Close" on:click={() => (visible = false)} />
        </Container>
      </Container>
    </div>
  </div>
{/if}
