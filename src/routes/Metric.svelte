<script lang="ts">
  import { createEventDispatcher } from "svelte";
  import IconButton from "./IconButton.svelte";

  const dispatch = createEventDispatcher();

  /** (required) The custom name of the metric */
  export let name = "";
  /** (required) The type of the metric */
  export let type = "";
  /** The value stored by the metric */
  export let value: any = null;
  /** (optional) Group name for this and subsequent metrics */
  export let group = "";

  /** (`select`, required) Possible metric values */
  export let values: any[] = [];
  /** (`text`, optional) Placeholder text */
  export let tip = "";

  /** (`timer`) Whether the timer is running */
  let running = false;
  /** (`timer`) Interval reference for the timer */
  let interval: NodeJS.Timer;

  /** (`timer` function) */
  function start() {
    running = true;
    interval = setInterval(() => {
      if (running) {
        value = (parseFloat(value) + 0.1).toFixed(1);
      }
    }, 100);
  }

  /** (`timer` function) */
  function pause() {
    running = false;
    clearInterval(interval);
  }

  /** (`timer` function) */
  function stop() {
    if (type == "timer") {
      if (running) {
        pause();
      }
      value = 0;
    }
  }

  // Svelte calls `dispatch()` whenever `value` changes
  $: {
    value;
    dispatch("update");
  }
</script>

{#if group}
  <span class="group">{group}</span>
{/if}
<div class:max-width={type == "text"}>
  {#if type != "toggle"}
    {name}
  {/if}
  <div class="flex">
    {#if type == "toggle"}
      <IconButton
        on:click={() => (value = !value)}
        icon={value ? "check" : "nocheck"}
        text={name}
      />
    {:else if type == "number"}
      <IconButton on:click={() => value++} icon="plus" />
      <span class="number">{value}</span>
      <IconButton on:click={() => value--} icon="minus" />
    {:else if type == "select"}
      <select bind:value>
        {#each values as val}
          <option value={val}>{val}</option>
        {/each}
      </select>
    {:else if type == "text"}
      <input placeholder={tip} bind:value />
    {:else if type == "rating"}
      {#each [...Array(5).keys()] as i}
        <IconButton
          on:click={() => (value = i)}
          icon={value >= i ? "star" : "nostar"}
        />
      {/each}
    {:else if type == "timer"}
      <IconButton
        on:click={running ? pause : start}
        icon={running ? "pause" : "play"}
      />
      <span class="number">{value}</span>
      <IconButton on:click={stop} icon="stop" />
    {/if}
  </div>
</div>
