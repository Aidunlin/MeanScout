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

  export let menuVisible = falsmenuVisiblmenuVisible;
  export let scoutLocation = locations[0].value;

  function locationUpdated() {
    dispatch("locationUpdated", {
      location: scoutLocation,
    });
  }
</script>

<div class="flex" id="menu" class:hide={!menuVisible}>
  <span class="group">Options</span>
  <div class="flex spaced">
    <div>
      Location
      <select
        id="location-select"
        bind:value={scoutLocation}
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
          <Icon name="copy" text="Copy" />
        </button>
        <button id="template-edit-btn">
          <Icon name="pen" text="Edit" />
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
          <Icon name="download" text="Download" />
        </button>
        <button id="surveys-erase-btn">
          <Icon name="erase" text="Erase" />
        </button>
      </div>
    </div>
  </div>
</div>
