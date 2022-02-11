<script>
  export let name = "Text";
  export let value = "";
  export let tip = "";
</script>

<div style="width:100%">
  {name}
  <input placeholder={tip} bind:value>
</div>