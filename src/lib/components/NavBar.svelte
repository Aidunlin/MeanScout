<script lang="ts">
  import Anchor from "./Anchor.svelte";
  import Container from "./Container.svelte";

  export let currentHash: any;
  export let baseHash = "";
  export let links: { hash: string; iconName: string; text: string }[];
</script>

<Container padding noGap>
  {#each links as { hash, iconName, text }}
    <Anchor hash="{baseHash && `${baseHash}/`}{hash}" {iconName} {text} disableTheme={hash != currentHash} />
  {/each}
</Container>
