<script>
  import { createEventDispatcher } from "svelte";
  import Icon from "../Icon.svelte";

  const dispatch = createEventDispatcher();

  export let name = "Toggle";
  export let value = false;

  function toggle() {
    value = !value;
    dispatch("update");
  }
</script>

<div>
  <button on:click={toggle}>
    <Icon name="square-{value ? 'checked' : 'empty'}" text={name} />
  </button>
</div>
