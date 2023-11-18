<script lang="ts">
  import { targetStore } from "$lib/target";
  import Anchor from "./Anchor.svelte";
  import Container from "./Container.svelte";

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
    <a class="breadcrumb" href="#/main/surveys">
      <img src="./logo.svg" alt="" width="30" height="30" />
      MeanScout
    </a>

    {#each breadcrumbs as { text, iconName, hash }}
      {#if hash}
        <a class="breadcrumb" href="#/{hash}">
          {#if iconName}
            <i class="fa-solid fa-{iconName} fa-fw" />
          {/if}
          {text}
        </a>
      {:else}
        <div class="breadcrumb">
          {#if iconName}
            <i class="fa-solid fa-{iconName} fa-fw" />
          {/if}
          <h1>{text}</h1>
        </div>
      {/if}
    {/each}
  {:else}
    <div class="breadcrumb">
      <img src="./logo.svg" alt="" width="30" height="30" />
      <h1>MeanScout</h1>
    </div>
  {/if}

  {#if views.length > 0 && currentView && baseHash}
    <Container noGap>
      {#each views as { text, iconName, hash }}
        <Anchor hash="{baseHash}/{hash}" {iconName} {text} disableTheme={hash != currentView} />
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

  .breadcrumb {
    align-items: center;
    display: flex;
    gap: var(--inner-gap);
    justify-content: center;
    padding: var(--inner-gap);
    text-decoration: none;
  }

  a {
    background: var(--fg-color);
  }

  a:focus,
  a:hover {
    outline: var(--outline);
  }

  span {
    color: var(--theme-color);
    margin-left: auto;
    padding: var(--inner-gap);
    text-transform: capitalize;
  }
</style>
