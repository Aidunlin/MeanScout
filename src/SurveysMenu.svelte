<script>
  import { surveyTypes } from "./Global.svelte";
  import IconButton from "./IconButton.svelte";
  import Metric from "./Metric.svelte";

  /** The file type to be utilized when downloading surveys */
  let surveyType = surveyTypes[0];

  /**
   * Creates a multiline CSV string for an array of surveys
   * @param surveys An array of surveys (each survey is an array of metric objects)
   */
  function generateCSV(surveys) {
    let csv = "";
    if (surveys) {
      surveys.forEach((survey) => {
        let surveyAsCSV = "";
        survey.forEach((metric) => {
          if (typeof metric.value == "string") surveyAsCSV += '"' + metric.value + '",';
          else surveyAsCSV += metric.value + ",";
        });
        csv += surveyAsCSV + "\n";
      });
    }
    return csv;
  }

  /** Creates and downloads a file containing surveys */
  function downloadSurveys() {
    let storedSurveys = localStorage.getItem("surveys");
    if (storedSurveys) {
      const anchor = document.createElement("a");
      anchor.href = "data:text/plain;charset=utf-8,";
      if (surveyType == "CSV") anchor.href += encodeURIComponent(generateCSV(JSON.parse(storedSurveys)));
      else if (surveyType == "JSON") anchor.href += encodeURIComponent(storedSurveys);
      anchor.download = `surveys.${surveyType.toLowerCase()}`;
      document.body.append(anchor);
      anchor.click();
      anchor.remove();
    }
  }

  /** Checks if the user wants to download surveys, doing so if they confirm */
  function askDownloadSurveys() {
    if (confirm("Confirm download?")) downloadSurveys();
  }

  /** Confirms the user wants to erase stored surveys in `localStorage`, doing so if they confirm */
  function eraseSurveys() {
    if (prompt("Type 'erase' to erase saved surveys") == "erase") localStorage.removeItem("surveys");
  }
</script>

<span class="group">Surveys</span>
<Metric name="Type" type="select" values={surveyTypes} bind:value={surveyType} />
<IconButton on:click={askDownloadSurveys} icon="download" text="Download" />
<IconButton on:click={eraseSurveys} icon="erase" text="Erase" />
