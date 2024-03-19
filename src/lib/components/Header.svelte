<script lang="ts">
  import { modeStore } from "$lib/mode";
import { targetStore } from "$lib/target";
  import Anchor from "./Anchor.svelte";
  import Container from "./Container.svelte";
  import Icon from "./Icon.svelte";

  export let backLink: string | undefined = undefined;
  export let title: string | undefined = undefined;
  export let iconName: string | undefined = undefined;
</script>

<header>
  {#if backLink !== undefined}
    <Anchor hash={backLink}>
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
