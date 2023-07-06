<script lang="ts">
  export let iconStyle = "solid";
  export let iconName = "";
  export let text = "";
  export let title = text;
  export let disableTheme = false;
</script>

<button on:click class:star={iconName.includes("star")} class:disable-theme={disableTheme} {title}>
  {#if iconStyle && iconName}
    <i class="fa-{iconStyle} fa-{iconName} fa-fw" />
  {/if}
  {text}
</button>
