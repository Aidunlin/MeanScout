<script lang="ts">
  export let iconStyle = "solid";
  export let iconName = "";
  export let text = "";
  export let title = text;
</script>

<button on:click class:star={iconName.includes("star")} {title}>
  {#if iconStyle && iconName}
    <i class="fa-{iconStyle} fa-{iconName} fa-fw" />
  {/if}
  {text}
</button>
