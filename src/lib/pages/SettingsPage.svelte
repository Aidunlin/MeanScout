<script lang="ts">
  import Button from "$lib/components/Button.svelte";
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

<Container padding>
  <Container column noGap>
    Target
    <select bind:value={$targetStore} title="Target">
      {#each targets as target}
        <option>{target}</option>
      {/each}
    </select>
  </Container>
</Container>

<Container column padding>
  <h2>The Blue Alliance</h2>
  <Container alignEnd>
    <Container noGap>
      Read Key
      <input bind:value={tbaKey} title="TBA Key" />
    </Container>
    <Button disabled={!tbaKey.length || tbaKey == $tbaKeyStore} on:click={testTBA}>
      <Icon name="floppy-disk" />
      Save
    </Button>
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
