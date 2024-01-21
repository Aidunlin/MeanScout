<script lang="ts">
  import { fieldTypes, type Field } from "$lib";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let idb: IDBDatabase;

  let files: FileList | undefined = undefined;
  let error = "";

  function parseName(name: any) {
    if (typeof name != "string" || !name.trim()) {
      const currentDate = new Date().toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
      return `Survey ${currentDate}`;
    }

    return name;
  }

  function parseFields(fields: any[]): Field[] {
    return fields.filter((field) => {
      if (typeof field != "object") return false;
      if (typeof field.name != "string" || !field.name.trim()) return false;

      if (!fieldTypes.includes(field.type)) return false;
      if (field.type == "select" && !Array.isArray(field.values)) return false;
      if (field.type == "group" && !Array.isArray(field.fields)) return false;

      return true;
    });
  }

  function parseMatches(matches: any[]) {
    return matches.filter((match) => {
      if (typeof match != "object") return false;
      if (typeof match.number != "number") return false;

      if (typeof match.red1 != "string") return false;
      if (typeof match.red2 != "string") return false;
      if (typeof match.red3 != "string") return false;

      if (typeof match.blue1 != "string") return false;
      if (typeof match.blue2 != "string") return false;
      if (typeof match.blue3 != "string") return false;

      return true;
    });
  }

  function parseTeams(teams: any[]) {
    return teams
      .filter((team: any) => typeof team == "number" || typeof team == "string")
      .map((team: number | string) => team.toString());
  }

  function parseDate(date: any) {
    if (typeof date != "string" || Number.isNaN(Date.parse(date))) {
      return new Date(date);
    }

    return new Date();
  }

  async function onConfirm() {
    if (!files?.length) {
      error = "No input";
      return;
    }

    let survey: any;

    try {
      const surveyText = await files[0].text();
      survey = JSON.parse(surveyText.trim());
    } catch (e) {
      error = "Invalid input";
      return;
    }

    delete survey.id;
    survey.name = parseName(survey.name);
    survey.fields = Array.isArray(survey.fields) ? parseFields(survey.fields) : [];
    survey.matches = Array.isArray(survey.matches) ? parseMatches(survey.matches) : [];
    survey.teams = Array.isArray(survey.teams) ? parseTeams(survey.teams) : [];
    survey.created = parseDate(survey.created);
    survey.modified = parseDate(survey.modified);
    delete survey.entries;

    const addRequest = idb.transaction("surveys", "readwrite").objectStore("surveys").add(survey);
    addRequest.onerror = () => {
      error = `Could not add survey: ${addRequest.error?.message}`;
    };

    addRequest.onsuccess = () => {
      const id = addRequest.result as number | undefined;
      if (id == undefined) {
        error = "Could not add survey";
        return;
      }

      location.hash = `/survey/${id}`;
    };
  }
</script>

<Dialog {onConfirm} on:close={() => (error = "")}>
  <Button title="Import survey" slot="opener" let:open on:click={open}>
    <Container maxWidth>
      <Icon name="paste" />
      Import survey
    </Container>
  </Button>

  <span>Import survey</span>
  <input type="file" accept=".json,.txt" bind:files />
  {#if error}
    <span>Could not import survey!</span>
    <span>{error}</span>
  {/if}
</Dialog>
