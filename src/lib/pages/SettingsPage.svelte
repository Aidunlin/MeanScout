<script lang="ts">
  import Button from "$lib/components/Button.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";
  import { targets, targetStore } from "$lib/target";
  import { fetchTBA, tbaKeyStore } from "$lib/tba";

  let tbaKeyInput = $tbaKeyStore;
  let testResult = "";

  function testTBA() {
    testResult = "please wait.";

    if (!navigator.onLine) {
      testResult = "offline!";
      return;
    }

    fetchTBA("/status", tbaKeyInput)
      .then((response) => {
        if (response.status == "success") {
          $tbaKeyStore = tbaKeyInput;
          testResult = "success! Key saved.";
        } else {
          testResult = `${response.status}!`;
        }
      })
      .catch(() => (testResult = "error!"));
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

{#if navigator.onLine}
  <Container direction="column" padding="large">
    <h2>The Blue Alliance</h2>
    <Container align="end">
      <Container gap="none">
        Read Key
        <input bind:value={tbaKeyInput} title="TBA Key" />
      </Container>
      <Button disabled={!tbaKeyInput.length || tbaKeyInput == $tbaKeyStore} on:click={testTBA}>
        <Icon name="floppy-disk" />
        Save
      </Button>
    </Container>
    {#if testResult}
      <span>Testing... {testResult}</span>
    {/if}
  </Container>
{/if}
