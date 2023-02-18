<script lang="ts">
  import { getMetricDefaultValue } from "$lib/metrics";
  import { currentEntry, currentSurveyIndex, currentSurveyName, localStorageStore, surveys } from "$lib/stores";
  import { downloadSurvey, surveyToTemplate, templateToSurvey } from "$lib/surveys";
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

  $: surveyNames = $surveys.map((survey) => survey.name);

  function copyTemplate() {
    if ($currentSurveyIndex < 0) {
      alert("Could not copy template");
      return;
    }
    let templateString = JSON.stringify(surveyToTemplate($surveys[$currentSurveyIndex]));
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
        if ($surveys.map((survey) => survey.name).includes(result.name)) {
          alert(`Could not set template! ${result.name} already exists`);
        } else {
          console.log(templateToSurvey(result));
          $surveys = [...$surveys, templateToSurvey(result)];
          // $currentSurveyName = result.name;
        }
      }
    }
  }

  function deleteSurvey() {
    if (confirm("Confirm delete?")) {
      let surveyName = $currentSurveyName;
      $surveys = $surveys.filter((survey) => survey.name != surveyName);
      if (!$surveys.length) {
        $surveys = [templateToSurvey(exampleTemplate)];
      }
      $currentSurveyName = $surveys[0].name;
      $currentEntry = {
        team: "",
        match: 1,
        isAbsent: false,
        metrics: $surveys[$currentSurveyIndex].configs.map(getMetricDefaultValue),
      };
    }
  }

  function askDownloadEntries() {
    if ($currentSurveyIndex >= 0 && confirm("Confirm download?")) {
      downloadSurvey($surveys[$currentSurveyIndex]);
    }
  }

  function eraseEntries() {
    if ($currentSurveyIndex >= 0 && confirm("Confirm erase?")) {
      $surveys[$currentSurveyIndex].entries = [];
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
  />
  <IconButton on:click={copyTemplate} icon="copy" text="Copy" />
  <IconButton on:click={deleteSurvey} icon="reset" text="Delete" />

  <span class="group">Entries</span>
  <IconButton on:click={askDownloadEntries} icon="download" text="Download" />
  <IconButton on:click={eraseEntries} icon="erase" text="Erase" />
</div>
