<script lang="ts">
  import { indexes, mainPage, parseSurvey, surveys, type DialogData, type Survey, surveyPage } from "$lib/app";
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";

  let newSurveyDialog: DialogData & { name: string; error: string } = {
    element: undefined,
    name: "",
    error: "",
    show() {
      this.name = "";
      this.error = "";
      this.element?.showModal();
    },
    confirm() {
      if (!this.name) return;
      if ($surveys.map((survey) => survey.name).includes(this.name)) {
        this.error = "That name is already used!";
        return;
      }
      let survey: Survey = {
        name: this.name,
        configs: [],
        teams: [],
        entries: [],
      };
      $surveys = [survey, ...$surveys];
      this.close();
    },
    close() {
      this.name = "";
      this.error = "";
      this.element?.close();
    },
  };

  let pasteSurveyDialog: DialogData & { input: string; error: string } = {
    element: undefined,
    input: "",
    error: "",
    show() {
      this.input = "";
      this.error = "";
      this.element?.showModal();
    },
    confirm() {
      if (!this.input) return;
      let result = parseSurvey(this.input);
      if (typeof result == "string") {
        this.error = `Could not set survey! ${result}`;
        return;
      }
      if ($surveys.map((survey) => survey.name).includes(result.name)) {
        this.error = `Could not set survey! ${result.name} already exists`;
        return;
      }
      $surveys = [result, ...$surveys];
      this.close();
    },
    close() {
      this.input = "";
      this.error = "";
      this.element?.close();
    },
  };

  let deleteSurveyDialog: DialogData & { surveyIndex: number | undefined } = {
    element: undefined,
    surveyIndex: undefined,
    show() {
      this.element?.showModal();
    },
    confirm() {
      $surveys = $surveys.filter((_, idx) => idx != this.surveyIndex);
      this.close();
    },
    close() {
      this.surveyIndex = undefined;
      this.element?.close();
    },
  };
</script>

<Header />

<Container padding noGap>
  <Button iconName="list-ul" title="Surveys" />
  <Button iconName="ellipsis-vertical" title="Options" disableTheme on:click={() => ($mainPage = "options")} />
</Container>

<Container column padding>
  <h2>Surveys</h2>
  {#each $surveys as survey, surveyIndex (survey)}
    <Container spaceBetween>
      <Container>
        <Button
          iconName="pen"
          title="Edit survey"
          on:click={() => {
            $surveyPage = "entries";
            $indexes.survey = surveyIndex;
          }}
        />
        <span>{survey.name}</span>
        {#if survey.entries.length}
          <span>({survey.entries.length} {survey.entries.length == 1 ? "entry" : "entries"})</span>
        {/if}
      </Container>
      <Button
        iconName="trash"
        on:click={() => {
          deleteSurveyDialog.surveyIndex = surveyIndex;
          deleteSurveyDialog.show();
        }}
      />
    </Container>
  {/each}

  <dialog bind:this={deleteSurveyDialog.element}>
    {#if deleteSurveyDialog.surveyIndex != undefined}
      <span>Delete this survey?</span>
      <span>Everything in "{$surveys[deleteSurveyDialog.surveyIndex].name}" will be lost!</span>
      <Container spaceBetween>
        <Button iconName="check" title="Confirm" on:click={() => deleteSurveyDialog.confirm()} />
        <Button iconName="xmark" title="Close" on:click={() => deleteSurveyDialog.close()} />
      </Container>
    {/if}
  </dialog>
</Container>

<footer>
  <Button iconName="plus" title="New survey" on:click={() => newSurveyDialog.show()} />
  <dialog bind:this={newSurveyDialog.element}>
    <span>Enter name for new survey:</span>
    <input bind:value={newSurveyDialog.name} />
    {#if newSurveyDialog.error}
      <span>{newSurveyDialog.error}</span>
    {/if}
    <Container spaceBetween>
      <Button iconName="check" title="Confirm" on:click={() => newSurveyDialog.confirm()} />
      <Button iconName="xmark" title="Close" on:click={() => newSurveyDialog.close()} />
    </Container>
  </dialog>

  <Button iconName="paste" title="Paste survey" on:click={() => pasteSurveyDialog.show()} />
  <dialog bind:this={pasteSurveyDialog.element}>
    <span>Paste new survey:</span>
    <Container maxWidth>
      <textarea bind:value={pasteSurveyDialog.input} />
    </Container>
    {#if pasteSurveyDialog.error}
      <span>{pasteSurveyDialog.error}</span>
    {/if}
    <Container spaceBetween>
      <Button iconName="check" title="Confirm" on:click={() => pasteSurveyDialog.confirm()} />
      <Button iconName="xmark" title="Close" on:click={() => pasteSurveyDialog.close()} />
    </Container>
  </dialog>
</footer>
