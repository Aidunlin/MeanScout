<script lang="ts">
  import Anchor from "$lib/components/Anchor.svelte";
  import Container from "$lib/components/Container.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { modeStore, targetStore } from "$lib/settings";

  let {
    backLink = undefined,
    title = undefined,
    iconName = undefined,
  }: {
    backLink?: string | undefined;
    title?: string | undefined;
    iconName?: string | undefined;
  } = $props();
</script>

<header>
  {#if backLink !== undefined}
    <Anchor route={backLink}>
      <Icon name="arrow-left" />
    </Anchor>
  {/if}

  <Container align="center" padding="small">
    {#if iconName !== undefined}
      <Icon name={iconName} />
    {:else}
      <img src="./logo.svg" alt="" width="30" height="30" />
    {/if}
    <h1>{title ?? "MeanScout"}</h1>
  </Container>

  <span>{$modeStore == "admin" ? "Admin" : $targetStore}</span>
</header>

<style>
  header {
    align-items: center;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: var(--outer-gap);
    padding: var(--outer-gap) var(--outer-gap) calc(var(--outer-gap) * 2);
  }

  span {
    color: var(--theme-color);
    padding: var(--inner-gap);
    text-align: right;
    text-transform: capitalize;
  }
</style>
