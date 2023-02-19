<script lang="ts">
  import { newEntry, resetCustom } from "$lib/entries";
  import { currentEntry, currentSurveyName, localStorageStore, surveys } from "$lib/stores";
  import { downloadSurveyEntries, exampleSurvey, parseSurvey, type Survey } from "$lib/surveys";
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

  function copySurvey() {
    let surveyString = JSON.stringify(currentSurvey as Omit<Survey, "entries">);
    if ("clipboard" in navigator) {
      navigator.clipboard.writeText(surveyString);
      alert("Copied survey");
    } else {
      prompt("Copy the survey below", surveyString);
    }
  }

  function newSurvey() {
    const newPrompt = prompt("Paste new survey:");
    if (newPrompt) {
      let result = parseSurvey(newPrompt);
      if (typeof result == "string") {
        alert(`Could not set survey! ${result}`);
      } else {
        if (surveyNames.includes(result.name)) {
          alert(`Could not set survey! ${result.name} already exists`);
        } else {
          $surveys = [result, ...$surveys];
          $currentSurveyName = result.name;
          $currentEntry = newEntry(result);
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
        $currentEntry = newEntry(exampleSurvey);
        $surveys = [exampleSurvey];
        $currentSurveyName = exampleSurvey.name;
      }
    }
  }

  function askDownloadEntries() {
    if (confirm("Confirm download?")) {
      downloadSurveyEntries(currentSurvey);
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
  <IconButton on:click={newSurvey} icon="pen" text="New" />
  <MetricEditor
    config={{ name: "Current", type: "select", values: surveyNames }}
    bind:value={$currentSurveyName}
    on:update={() => ($currentEntry = resetCustom(currentSurvey, $currentEntry))}
  />
  <IconButton on:click={copySurvey} icon="copy" text="Copy" />
  <IconButton on:click={deleteSurvey} icon="reset" text="Delete" />

  <span class="group">Entries</span>
  <IconButton on:click={askDownloadEntries} icon="download" text="Download" />
  <IconButton on:click={eraseEntries} icon="erase" text="Erase" />
</div>
