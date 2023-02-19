<script lang="ts">
  import { newEntry } from "$lib/entries";
  import { currentEntry, currentSurveyIndex, surveys } from "$lib/stores";
  import { onMount } from "svelte";
  import EntryEditor from "./EntryEditor.svelte";
  import Menu from "./Menu.svelte";

  onMount(() => {
    document.body.classList.remove("hide");

    if ($surveys[$currentSurveyIndex]) {
      $currentEntry = newEntry($surveys[$currentSurveyIndex]);
    }
  });
</script>

<svelte:head>
  <title>MeanScout</title>
</svelte:head>

<Menu bind:currentSurvey={$surveys[$currentSurveyIndex]} />
<EntryEditor bind:currentSurvey={$surveys[$currentSurveyIndex]} />
