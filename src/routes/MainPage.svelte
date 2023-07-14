<script lang="ts">
  import { parseSurvey, surveys } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Dialog from "$lib/components/Dialog.svelte";
  import Header from "$lib/components/Header.svelte";

  let newSurveyDialog = { name: "", error: "" };
  let pasteSurveyDialog = { input: "", error: "" };
</script>

<Header />

<Container padding noGap>
  <Button iconName="list-ul" title="Surveys" />
  <Button
    iconName="ellipsis-vertical"
    title="Options"
    disableTheme
    on:click={() => (window.location.hash = "options")}
  />
</Container>

<Container column padding>
  <h2>Surveys</h2>
  {#each $surveys as survey, surveyIndex (survey)}
    <Container spaceBetween>
      <Container>
        <Button iconName="pen" title="Edit survey" on:click={() => (window.location.hash = `${surveyIndex}`)} />
        <span>{survey.name}</span>
        {#if survey.entries.length}
          <span>({survey.entries.length} {survey.entries.length == 1 ? "entry" : "entries"})</span>
        {/if}
      </Container>

      <Dialog
        openButton={{ iconName: "trash", title: "Delete entry" }}
        onConfirm={() => {
          $surveys = $surveys.filter((_, idx) => idx != surveyIndex);
          return true;
        }}
      >
        <span>Delete this survey?</span>
        <span>Everything in "{$surveys[surveyIndex].name}" will be lost!</span>
      </Dialog>
    </Container>
  {/each}
</Container>

<footer>
  <Dialog
    openButton={{ iconName: "plus", title: "New survey" }}
    onConfirm={() => {
      let name = newSurveyDialog.name.trim();
      if (!name) {
        newSurveyDialog.error = "Name can't be blank!";
        return false;
      }
      if ($surveys.map((survey) => survey.name).includes(name)) {
        newSurveyDialog.error = "That name is already used!";
        return false;
      }
      $surveys = [
        {
          name,
          configs: [
            {
              name: "Team",
              type: "team",
              required: true,
            },
            {
              name: "Match",
              type: "match",
              required: true,
            },
            {
              name: "Absent",
              type: "toggle",
              required: true,
            },
          ],
          teams: [],
          entries: [],
        },
        ...$surveys,
      ];
      return true;
    }}
    on:close={() => (newSurveyDialog = { name: "", error: "" })}
  >
    <span>Enter name for new survey:</span>
    <input bind:value={newSurveyDialog.name} />
    {#if newSurveyDialog.error}
      <span>{newSurveyDialog.error}</span>
    {/if}
  </Dialog>

  <Dialog
    openButton={{ iconName: "paste", title: "Import survey" }}
    onConfirm={() => {
      if (!pasteSurveyDialog.input) return false;
      let result = parseSurvey(pasteSurveyDialog.input);
      if (typeof result == "string") {
        pasteSurveyDialog.error = `Could not import survey! ${result}`;
        return false;
      }
      if ($surveys.map((survey) => survey.name).includes(result.name)) {
        pasteSurveyDialog.error = `Could not import survey! ${result.name} already exists`;
        return false;
      }
      $surveys = [result, ...$surveys];
      return true;
    }}
    on:close={() => (pasteSurveyDialog = { input: "", error: "" })}
  >
    <span>Paste new survey:</span>
    <Container maxWidth>
      <textarea bind:value={pasteSurveyDialog.input} />
    </Container>
    {#if pasteSurveyDialog.error}
      <span>{pasteSurveyDialog.error}</span>
    {/if}
  </Dialog>
</footer>
