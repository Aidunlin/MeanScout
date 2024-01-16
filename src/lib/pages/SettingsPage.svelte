<script lang="ts">
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { targets, targetStore } from "$lib/target";
  import { fetchTBA, tbaKeyStore } from "$lib/tba";

  let tbaKey = $tbaKeyStore;
  let testResult: "pending" | "error" | "offline" | number | undefined = undefined;

  function testTBA() {
    testResult = "pending";

    if (!navigator.onLine) {
      testResult = "offline";
      return;
    }

    fetchTBA("/status", tbaKey)
      .then((response) => {
        testResult = response.status;
        if (testResult == 200) {
          $tbaKeyStore = tbaKey;
        }
      })
      .catch(() => (testResult = "error"));
  }
</script>

<Header current={{ text: "Settings", iconName: "gears" }} />

<Container padding="large">
  <Container direction="column" gap="none">
    Target
    <select bind:value={$targetStore} title="Target">
      {#each targets as target}
        <option>{target}</option>
      {/each}
    </select>
  </Container>
</Container>

<Container direction="column" padding="large">
  <h2>The Blue Alliance</h2>
  <Container align="end">
    <Container gap="none">
      Read Key
      <input bind:value={tbaKey} title="TBA Key" />
    </Container>
    <Container type="button" onClick={testTBA} disabled={!tbaKey.length || tbaKey == $tbaKeyStore}>
      <Icon name="floppy-disk" />
      Save
    </Container>
  </Container>
  {#if testResult != undefined}
    <span>
      Testing...
      {#if testResult == 200}
        Success! Key saved.
      {:else if testResult == 401}
        Unauthorized!
      {:else if testResult == "offline"}
        Offline!
      {:else}
        Error!
      {/if}
    </span>
  {/if}
  <span>Note: the TBA API is not yet implemented, aside from checking and saving your API key to this device.</span>
</Container>
