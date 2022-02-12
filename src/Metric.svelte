<script context="module">
  export const metricTypes = [
    { name: "toggle", default: false },
    { name: "number", default: 0 },
    { name: "select", default: 0 },
    { name: "text", default: "" },
    { name: "rating", default: 0 },
    { name: "timer", default: 0 },
  ];

  export function getDefaultValue(typeName) {
    return metricTypes.find((type) => type.name == typeName).default ?? null;
  }
</script>

<script>
  import { createEventDispatcher } from "svelte";
  import Icon from "./Icon.svelte";

  const dispatch = createEventDispatcher();

  export let name = "";
  export let type = "";
  export let value = null;

  export let values = [];
  export let tip = "";
  export let count = 5;

  let running = false;
  let interval = null;

  function sendUpdate() {
    dispatch("update");
  }

  function toggle() {
    if (type == "toggle") {
      value = !value;
      sendUpdate();
    } else if (type == "timer") {
      if (running) {
        running = false;
        clearInterval(interval);
        sendUpdate();
      } else {
        running = true;
        interval = setInterval(() => {
          if (running) {
            value = (parseFloat(value) + 0.1).toFixed(1);
          }
        }, 100);
      }
    }
  }

  function crement(i) {
    if (type == "number") {
      value += i;
      sendUpdate();
    }
  }

  function update(newValue) {
    if (type == "rating") {
      value = newValue;
      sendUpdate();
    }
  }

  function reset() {
    if (type == "timer") {
      if (running) {
        toggle();
      }
      value = 0;
      sendUpdate();
    }
  }
</script>

{#if type == "toggle"}
  <div>
    <button on:click={toggle}>
      <Icon name="square-{value ? 'checked' : 'empty'}" text={name} />
    </button>
  </div>
{:else if type == "number"}
  <div>
    {name}
    <div class="flex">
      <button on:click={() => crement(1)}>
        <Icon name="plus" />
      </button>
      <input
        type="number"
        class="number"
        pattern="[0-9]*"
        readonly
        bind:value
      />
      <button on:click={() => crement(-1)}>
        <Icon name="minus" />
      </button>
    </div>
  </div>
{:else if type == "select"}
  <div>
    {name}
    <select bind:value on:change={sendUpdate}>
      {#each values as val}
        <option value={val}>{val}</option>
      {/each}
    </select>
  </div>
{:else if type == "text"}
  <div style="width:100%">
    {name}
    <input placeholder={tip} bind:value on:change={sendUpdate} />
  </div>
{:else if type == "rating"}
  <div>
    {name}
    <div class="flex">
      {#each [...Array(count).keys()] as i}
        <button class="star" on:click={() => update(i)}>
          <Icon name="star-{value >= i ? 'filled' : 'empty'}" />
        </button>
      {/each}
    </div>
  </div>
{:else if type == "timer"}
  <div>
    {name}
    <div class="flex">
      <button on:click={toggle}>
        <Icon name={running ? "pause" : "play"} />
      </button>
      <input
        type="number"
        class="number"
        readonly
        bind:value
        on:change={sendUpdate}
      />
      <button on:click={reset}>
        <Icon name="stop" />
      </button>
    </div>
  </div>
{/if}
