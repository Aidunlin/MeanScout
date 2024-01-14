<script lang="ts">
  import type { IDBRecord, Survey } from "$lib";
  import Anchor from "$lib/components/Anchor.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let idb: IDBDatabase;
  export let surveyRecord: IDBRecord<Survey>;

  $: idb.transaction("surveys", "readwrite").objectStore("surveys").put(surveyRecord);
</script>

<Header current={{ text: surveyRecord.name, iconName: "list-ul" }} />

<Container column padding>
  <Anchor hash="survey/{surveyRecord.id}/drafts">
    <Container maxWidth spaceBetween>
      <Container>
        <Icon name="pen-ruler" />
        Drafts
      </Container>
      <Icon name="arrow-right" />
    </Container>
  </Anchor>
  <Anchor hash="survey/{surveyRecord.id}/entries">
    <Container maxWidth spaceBetween>
      <Container>
        <Icon name="list-ol" />
        Entries
      </Container>
      <Icon name="arrow-right" />
    </Container>
  </Anchor>
  <Anchor hash="survey/{surveyRecord.id}/fields">
    <Container maxWidth spaceBetween>
      <Container>
        <Icon name="list-check" />
        Fields
      </Container>
      <Icon name="arrow-right" />
    </Container>
  </Anchor>
  <Anchor hash="survey/{surveyRecord.id}/options">
    <Container maxWidth spaceBetween>
      <Container>
        <Icon name="gears" />
        Options
      </Container>
      <Icon name="arrow-right" />
    </Container>
  </Anchor>
</Container>
