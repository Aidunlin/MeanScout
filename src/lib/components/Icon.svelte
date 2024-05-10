<script lang="ts">
  let {
    style = "solid",
    name,
  }: {
    style?: string;
    name: string;
  } = $props();
</script>

<i class="fa-{style} fa-{name} fa-fw"></i>
