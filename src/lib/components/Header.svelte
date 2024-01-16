<script lang="ts">
  import { targetStore } from "$lib/target";
  import Anchor from "./Anchor.svelte";
  import Icon from "./Icon.svelte";

  export let parent: { text: string; iconName: string; hash: string } | undefined = undefined;
  export let current: { text: string; iconName: string } | undefined = undefined;
</script>

<svelte:head>
  <title>MeanScout</title>
</svelte:head>

<header>
  <div style="justify-content: left;">
    {#if parent}
      <Anchor hash={parent.hash}>
        <Icon name="arrow-left" />
        {parent.text}
      </Anchor>
    {:else if current}
      <Anchor hash="">
        <Icon name="arrow-left" />
        MeanScout
      </Anchor>
    {/if}
  </div>

  <div style="justify-content: center;">
    {#if current}
      <Icon name={current.iconName} />
      <h1>{current.text}</h1>
    {:else}
      <img src="./logo.svg" alt="" width="30" height="30" />
      <h1>MeanScout</h1>
    {/if}
  </div>

  <span>{$targetStore}</span>
</header>

<style>
  header {
    align-items: center;
    background: var(--fg-color);
    display: flex;
    flex-wrap: wrap;
    gap: var(--outer-gap);
    padding: var(--outer-gap);
  }

  div {
    align-items: center;
    display: flex;
    flex: 1 1 0;
    gap: var(--inner-gap);
    text-decoration: none;
  }

  span {
    color: var(--theme-color);
    flex: 1 1 0;
    padding: var(--inner-gap);
    text-align: right;
    text-transform: capitalize;
  }
</style>
