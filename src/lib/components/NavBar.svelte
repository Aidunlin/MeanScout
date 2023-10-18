<script lang="ts">
  import Anchor from "./Anchor.svelte";
  import Container from "./Container.svelte";

  export let currentHash: any;
  export let baseHash = "";
  export let links: { hash: string; iconName: string; title: string }[];
</script>

<Container padding noGap>
  {#each links as { hash, iconName, title }}
    <Anchor hash="{baseHash && `${baseHash}/`}{hash}" {iconName} {title} disableTheme={hash != currentHash} />
  {/each}
</Container>
