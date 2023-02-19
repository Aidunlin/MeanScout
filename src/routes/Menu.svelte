<script lang="ts">
  import { newEntry, resetCustom } from "$lib/entries";
  import { currentEntry, currentSurveyName, localStorageStore, surveys } from "$lib/stores";
  import { downloadSurvey, surveyToTemplate, templateToSurvey, type Survey } from "$lib/surveys";
  import { exampleTemplate, parseTemplate } from "$lib/templates";
  import IconButton from "./IconButton.svelte";
  import MetricEditor from "./MetricEditor.svelte";

  type MenuState = "hide" | "show";
  const menuState = localStorageStore<MenuState>("menuState", "hide");

  function toggleMenu() {
    $menuState = $menuState == "hide" ? "show" : "hide";
  }

  const locations = ["Red Near", "Red Mid", "Red Far", "Blue Near", "Blue Mid", "Blue Far"] as const;
  type Location = typeof locations[number];
  const currentLocation = localStorageStore<Location>("currentLocation", "Red Near", setTheme);

  function setTheme(location: Location) {
    let newTheme = location.split(" ")[0].toLowerCase();
    document.documentElement.style.setProperty("--theme-color", `var(--${newTheme})`);
  }

  export let currentSurvey: Survey;

  $: surveyNames = $surveys.map((survey) => survey.name);

  function copyTemplate() {
    let templateString = JSON.stringify(surveyToTemplate(currentSurvey));
    if ("clipboard" in navigator) {
      navigator.clipboard.writeText(templateString);
      alert("Copied template");
    } else {
      prompt("Copy the template below", templateString);
    }
  }

  function newTemplate() {
    const newPrompt = prompt("Paste new template:");
    if (newPrompt) {
      let result = parseTemplate(newPrompt);
      if (typeof result == "string") {
        alert(`Could not set template! ${result}`);
      } else {
        if (surveyNames.includes(result.name)) {
          alert(`Could not set template! ${result.name} already exists`);
        } else {
          let survey = templateToSurvey(result);
          $surveys = [survey, ...$surveys];
          $currentSurveyName = survey.name;
          $currentEntry = newEntry(survey);
        }
      }
    }
  }

  function deleteSurvey() {
    if (confirm("Confirm delete?")) {
      if ($surveys.length > 1) {
        let survey = $surveys[0];
        $currentEntry = newEntry(survey);
        $surveys = $surveys.filter((s) => s.name != $currentSurveyName);
        $currentSurveyName = survey.name;
      } else {
        let survey = templateToSurvey(exampleTemplate);
        $currentEntry = newEntry(survey);
        $surveys = [survey];
        $currentSurveyName = survey.name;
      }
    }
  }

  function askDownloadEntries() {
    if (confirm("Confirm download?")) {
      downloadSurvey(currentSurvey);
    }
  }

  function eraseEntries() {
    if (confirm("Confirm erase?")) {
      currentSurvey.entries = [];
    }
  }
</script>

<div class="flex space-between spaced bg extend-bg">
  <button id="menu-toggle-btn" on:click={toggleMenu}>
    <img class="text-icon" id="logo" src="./logo.png" alt="" />MeanScout
  </button>
  <span id="location-text">{$currentLocation}</span>
</div>

<div class="flex spaced bg extend-bg" id="menu" class:hide={$menuState == "hide"}>
  <span class="group">Options</span>
  <MetricEditor
    config={{
      name: "Location",
      type: "select",
      values: Object.values(locations),
    }}
    bind:value={$currentLocation}
  />

  <span class="group">Surveys</span>
  <IconButton on:click={newTemplate} icon="pen" text="New" />
  <MetricEditor
    config={{ name: "Current", type: "select", values: surveyNames }}
    bind:value={$currentSurveyName}
    on:update={() => ($currentEntry = resetCustom(currentSurvey, $currentEntry))}
  />
  <IconButton on:click={copyTemplate} icon="copy" text="Copy" />
  <IconButton on:click={deleteSurvey} icon="reset" text="Delete" />

  <span class="group">Entries</span>
  <IconButton on:click={askDownloadEntries} icon="download" text="Download" />
  <IconButton on:click={eraseEntries} icon="erase" text="Erase" />
</div>
