<script lang="ts">
  import Anchor from "$lib/components/Anchor.svelte";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import Icon from "$lib/components/Icon.svelte";

  export let idb: IDBDatabase;
</script>

<Header />

<Container column padding>
  <Anchor hash="surveys">
    <Container maxWidth spaceBetween>
      <Container>
        <Icon name="list-ul" />
        Surveys
      </Container>
      <Icon name="arrow-right" />
    </Container>
  </Anchor>
  <Anchor hash="options">
    <Container maxWidth spaceBetween>
      <Container>
        <Icon name="gears" />
        Options
      </Container>
      <Icon name="arrow-right" />
    </Container>
  </Anchor>
</Container>
