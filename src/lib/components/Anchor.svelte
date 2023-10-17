<script lang="ts">
  export let hash = "";
  export let href = `#/${hash}`;
  export let iconStyle = "solid";
  export let iconName = "";
  export let text = "";
  export let title = text;
  export let disableTheme = false;
</script>

<a {href} {title} class:disable-theme={disableTheme}>
  {#if iconStyle && iconName}
    <i class="fa-{iconStyle} fa-{iconName} fa-fw" />
  {/if}
  {text}
</a>
