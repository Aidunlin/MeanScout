<script>
  import Icon from "./Icon.svelte";
  import { createEventDispatcher } from "svelte";

  const dispatch = createEventDispatcher();

  let locations = [
    { class: "red", value: "Red Near" },
    { class: "red", value: "Red Mid" },
    { class: "red", value: "Red Far" },
    { class: "blue", value: "Blue Near" },
    { class: "blue", value: "Blue Mid" },
    { class: "blue", value: "Blue Far" },
  ];

  export let visible = false;
  export let location = locations[0].value;

  function locationUpdated() {
    dispatch("locationUpdated", {
      location: location,
    });
  }
</script>

<div class="flex" id="menu" class:hide={!visible}>
  <span class="group">Options</span>
  <div class="flex spaced">
    <div>
      Location
      <select
        id="location-select"
        bind:value={location}
        on:change={locationUpdated}
      >
        {#each locations as location}
          <option class={location.class}>{location.value}</option>
        {/each}
      </select>
    </div>
    <div>
      Template
      <div class="flex">
        <button id="template-copy-btn">
          <Icon name="copy" />
          Copy
        </button>
        <button id="template-edit-btn">
          <Icon name="pen" />
          Edit
        </button>
      </div>
    </div>
    <div>
      Surveys
      <div class="flex">
        <div>
          <select id="download-type-sel">
            <option>CSV</option>
            <option>JSON</option>
          </select>
        </div>
        <button id="surveys-download-btn">
          <Icon name="download" />
          Download
        </button>
        <button id="surveys-erase-btn">
          <Icon name="erase" />
          Erase
        </button>
      </div>
    </div>
  </div>
</div>
