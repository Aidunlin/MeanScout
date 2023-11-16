<script lang="ts">
  import type { Entry, IDBRecord, Survey } from "$lib";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import "$lib/global.css";
  import DraftPage from "$lib/pages/DraftPage.svelte";
  import EntryPage from "$lib/pages/EntryPage.svelte";
  import MainPage from "$lib/pages/MainPage.svelte";
  import SurveyPage from "$lib/pages/SurveyPage.svelte";
  import type { ComponentProps } from "svelte";

  let idbError: string;
  let idb: IDBDatabase;

  let current:
    | { page: "main"; props: ComponentProps<MainPage> }
    | { page: "survey"; props: ComponentProps<SurveyPage> }
    | { page: "draft"; props: ComponentProps<DraftPage> }
    | { page: "entry"; props: ComponentProps<EntryPage> };

  function setMainPage(view: ComponentProps<MainPage>["view"] = "surveys") {
    if (current?.page == "main") {
      current.props.view = view;
      return;
    }

    current = {
      page: "main",
      props: { view, idb },
    };
  }

  function setSurveyPage(id: number, view: ComponentProps<SurveyPage>["view"]) {
    if (current?.page == "survey" && current.props.surveyRecord.id == id) {
      current.props.view = view;
      return;
    }

    if (current?.page == "entry") {
      current = {
        page: "survey",
        props: { view, idb, surveyRecord: current.props.surveyRecord },
      };
      return;
    }

    const surveyRequest = idb.transaction("surveys").objectStore("surveys").get(id);
    surveyRequest.onerror = () => setMainPage();

    surveyRequest.onsuccess = () => {
      const surveyRecord = surveyRequest.result as IDBRecord<Survey> | undefined;
      if (!surveyRecord) return setMainPage();

      current = {
        page: "survey",
        props: { view, idb, surveyRecord },
      };
    };
  }

  function setDraftPage(id: number) {
    if (current?.page == "draft" && current.props.draftRecord.id == id) {
      return;
    }

    const getTransaction = idb.transaction(["surveys", "drafts"]);
    getTransaction.onerror = () => setMainPage();

    const surveyStore = getTransaction.objectStore("surveys");
    const draftStore = getTransaction.objectStore("drafts");

    const draftRequest = draftStore.get(id);
    draftRequest.onerror = () => setMainPage();

    draftRequest.onsuccess = () => {
      const draftRecord = draftRequest.result as IDBRecord<Entry> | undefined;
      if (!draftRecord) return setMainPage();

      if (current?.page == "survey" || current?.page == "draft") {
        current = {
          page: "draft",
          props: { idb, surveyRecord: current.props.surveyRecord, draftRecord },
        };
        return;
      }

      const surveyRequest = surveyStore.get(draftRecord.surveyId);
      surveyRequest.onerror = () => setMainPage();

      surveyRequest.onsuccess = () => {
        const surveyRecord = surveyRequest.result as IDBRecord<Survey> | undefined;
        if (!surveyRecord) return setMainPage();

        current = {
          page: "draft",
          props: { idb, surveyRecord, draftRecord },
        };
      };
    };
  }

  function setEntryPage(id: number) {
    if (current?.page == "entry" && current.props.entryRecord.id == id) {
      return;
    }

    const getTransaction = idb.transaction(["surveys", "entries"]);
    getTransaction.onerror = () => setMainPage();

    const surveyStore = getTransaction.objectStore("surveys");
    const entryStore = getTransaction.objectStore("entries");

    const entryRequest = entryStore.get(id);
    entryRequest.onerror = () => setMainPage();

    entryRequest.onsuccess = () => {
      const entryRecord = entryRequest.result as IDBRecord<Entry> | undefined;
      if (!entryRecord) return setMainPage();

      if (current?.page == "survey" || current?.page == "entry") {
        current = {
          page: "entry",
          props: { idb, surveyRecord: current.props.surveyRecord, entryRecord },
        };
        return;
      }

      const surveyRequest = surveyStore.get(entryRecord.surveyId);
      surveyRequest.onerror = () => setMainPage();

      surveyRequest.onsuccess = () => {
        const surveyRecord = surveyRequest.result as IDBRecord<Survey> | undefined;
        if (!surveyRecord) return setMainPage();

        current = {
          page: "entry",
          props: { idb, surveyRecord, entryRecord },
        };
      };
    };
  }

  function handleHashChange() {
    const hash = location.hash.replace(/#\/?/, "").toLowerCase().trim().split("/");
    const page =
      hash[0] == "main" || hash[0] == "survey" || hash[0] == "draft" || hash[0] == "entry" ? hash[0] : "main";

    if (page == "main") {
      const view = hash[1] == "surveys" || hash[1] == "options" ? hash[1] : "surveys";
      setMainPage(view);
    } else if (page == "survey") {
      const view = hash[2] == "entries" || hash[2] == "configs" || hash[2] == "options" ? hash[2] : "entries";
      const id = Number(hash[1]);
      if (Number.isNaN(id)) return setMainPage();
      setSurveyPage(id, view);
    } else if (page == "draft") {
      const id = Number(hash[1]);
      if (Number.isNaN(id)) return setMainPage();
      setDraftPage(id);
    } else if (page == "entry") {
      const id = Number(hash[1]);
      if (Number.isNaN(id)) return setMainPage();
      setEntryPage(id);
    }
  }

  function openIDB() {
    const request = indexedDB.open("MeanScout", 5);
    request.onerror = () => (idbError = `${request.error?.message}`);

    request.onupgradeneeded = () => {
      const storeNames = request.result.objectStoreNames;

      if (!storeNames.contains("surveys")) {
        request.result.createObjectStore("surveys", { keyPath: "id", autoIncrement: true });
      }

      if (!storeNames.contains("drafts")) {
        const draftStore = request.result.createObjectStore("drafts", { keyPath: "id", autoIncrement: true });
        draftStore.createIndex("surveyId", "surveyId", { unique: false });
      }

      if (!storeNames.contains("entries")) {
        const entryStore = request.result.createObjectStore("entries", { keyPath: "id", autoIncrement: true });
        entryStore.createIndex("surveyId", "surveyId", { unique: false });
      }
    };

    request.onsuccess = () => {
      if (!request.result) {
        idbError = "Could not open IDB";
        return;
      }

      idb = request.result;
      handleHashChange();
      onhashchange = handleHashChange;
    };
  }

  openIDB();
</script>

{#if idbError}
  <Header />
  <Container padding>
    <h2>Error</h2>
    <p>
      MeanScout was unable to access IndexedDB. Double check that your device/browser supports it, and that you haven't
      removed the permission to access it.
    </p>
    <p>Error: {idbError}</p>
  </Container>
{:else if current?.page == "main"}
  <MainPage {...current.props} />
{:else if current?.page == "survey"}
  <SurveyPage {...current.props} />
{:else if current?.page == "draft"}
  {#key current.props.draftRecord.id}
    <DraftPage {...current.props} />
  {/key}
{:else if current?.page == "entry"}
  {#key current.props.entryRecord.id}
    <EntryPage {...current.props} />
  {/key}
{/if}
