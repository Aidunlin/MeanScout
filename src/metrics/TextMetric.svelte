<script>
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  export let name = "Text";
  export let value = "";
  export let tip = "";

  function changed() {
    dispatch("update");
  }
</script>

<div style="width:100%">
  {name}
  <input placeholder={tip} bind:value on:change={changed} />
</div>
