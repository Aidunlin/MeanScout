<script lang="ts">
  import { type FileFormat, fileFormats, savedSurveys, type Survey } from "$lib/Global.svelte";
  import IconButton from "$lib/IconButton.svelte";
  import Metric from "$lib/Metric.svelte";

  /** The file type to be utilized when downloading surveys */
  let surveyType: FileFormat = "CSV";

  /**
   * Creates a multiline CSV string for an array of surveys
   * @param surveys An array of surveys (each survey is an array of metric objects)
   */
  function generateCSV(surveys: Survey[]) {
    let csv = "";
    if (surveys) {
      surveys.forEach((survey) => {
        let surveyAsCSV = "";
        survey.forEach((metric) => {
          if (typeof metric.value == "string") {
            surveyAsCSV += '"' + metric.value + '",';
          } else {
            surveyAsCSV += metric.value + ",";
          }
        });
        csv += surveyAsCSV + "\n";
      });
    }
    return csv;
  }

  /** Creates and downloads a file containing surveys */
  function downloadSurveys() {
    const anchor = document.createElement("a");
    anchor.href = "data:text/plain;charset=utf-8,";
    if (surveyType == "CSV") {
      anchor.href += encodeURIComponent(generateCSV($savedSurveys));
    } else if (surveyType == "JSON") {
      anchor.href += encodeURIComponent(JSON.stringify($savedSurveys));
    }
    anchor.download = `surveys.${surveyType.toLowerCase()}`;
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
  }

  /** Checks if the user wants to download surveys, doing so if they confirm */
  function askDownloadSurveys() {
    if ($savedSurveys && confirm("Confirm download?")) {
      downloadSurveys();
    }
  }

  /** Confirms the user wants to erase saved surveys, doing so if they confirm */
  function eraseSurveys() {
    if (confirm("Confirm erase?")) {
      $savedSurveys = [];
    }
  }
</script>

<span class="group">Surveys</span>
<Metric config={{ name: "Type", type: "select", values: Object.values(fileFormats) }} bind:value={surveyType} />
<IconButton on:click={askDownloadSurveys} icon="download" text="Download" />
<IconButton on:click={eraseSurveys} icon="erase" text="Erase" />
