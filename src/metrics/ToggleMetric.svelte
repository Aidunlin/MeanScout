<script>
  import Icon from "../Icon.svelte";
  export let name = "Toggle";
  export let value = false;

  function toggle() {
    value = !value;
  }
</script>

<div>
  <button on:click={toggle}>
    <Icon name="square-{value ? 'checked' : 'empty'}" text={name} />
  </button>
</div>
