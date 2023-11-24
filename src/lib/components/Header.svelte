<script lang="ts">
  import { targetStore } from "$lib/target";
  import Anchor from "./Anchor.svelte";
  import Container from "./Container.svelte";
  import Icon from "./Icon.svelte";

  export let breadcrumbs: { text: string; iconName?: string | undefined; hash?: string | undefined }[] = [];
  export let views: { text: string; iconName: string; hash: string }[] = [];
  export let currentView = "";
  export let baseHash = "";
</script>

<svelte:head>
  <title>{["MeanScout", ...breadcrumbs.map((b) => b.text)].reverse().join(" - ")}</title>
</svelte:head>

<header>
  {#if breadcrumbs.length > 0}
    <Anchor hash="main/surveys">
      <img src="./logo.svg" alt="" width="30" height="30" />
      MeanScout
    </Anchor>

    {#each breadcrumbs as { text, iconName, hash }}
      {#if hash}
        <Anchor {hash}>
          {#if iconName}
            <Icon name={iconName} />
          {/if}
          {text}
        </Anchor>
      {:else}
        <div>
          {#if iconName}
            <Icon name={iconName} />
          {/if}
          <h1>{text}</h1>
        </div>
      {/if}
    {/each}
  {:else}
    <div>
      <img src="./logo.svg" alt="" width="30" height="30" />
      <h1>MeanScout</h1>
    </div>
  {/if}

  {#if views.length > 0 && currentView && baseHash}
    <Container noGap>
      {#each views as { text, iconName, hash }}
        <Anchor hash="{baseHash}/{hash}" disableTheme={hash != currentView}>
          <Icon name={iconName} />
          {text}
        </Anchor>
      {/each}
    </Container>
  {/if}

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
    gap: var(--inner-gap);
    justify-content: center;
    padding: var(--inner-gap);
    text-decoration: none;
  }

  span {
    color: var(--theme-color);
    margin-left: auto;
    padding: var(--inner-gap);
    text-transform: capitalize;
  }
</style>
