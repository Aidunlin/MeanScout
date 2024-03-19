<script lang="ts">
  import { persistStorage } from "$lib";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import "$lib/global.css";
  import EntryPage from "$lib/pages/EntryPage.svelte";
  import MainPage from "$lib/pages/MainPage.svelte";
  import SettingsPage from "$lib/pages/SettingsPage.svelte";
  import SurveyEntriesPage from "$lib/pages/SurveyEntriesPage.svelte";
  import SurveyFieldsPage from "$lib/pages/SurveyFieldsPage.svelte";
  import SurveyMatchesPage from "$lib/pages/SurveyMatchesPage.svelte";
  import SurveyOptionsPage from "$lib/pages/SurveyOptionsPage.svelte";
  import SurveyPage from "$lib/pages/SurveyPage.svelte";
  import SurveyTeamsPage from "$lib/pages/SurveyTeamsPage.svelte";
  import type { ComponentProps } from "svelte";

  let idbError: string;
  let idb: IDBDatabase;

  let current:
    | { page: ""; props: ComponentProps<MainPage> }
    | { page: "settings"; props: ComponentProps<SettingsPage> }
    | { page: "survey"; subpage: ""; props: ComponentProps<SurveyPage> }
    | { page: "survey"; subpage: "entries"; props: ComponentProps<SurveyEntriesPage> }
    | { page: "survey"; subpage: "fields"; props: ComponentProps<SurveyFieldsPage> }
    | { page: "survey"; subpage: "matches"; props: ComponentProps<SurveyMatchesPage> }
    | { page: "survey"; subpage: "teams"; props: ComponentProps<SurveyTeamsPage> }
    | { page: "survey"; subpage: "options"; props: ComponentProps<SurveyOptionsPage> }
    | { page: "entry"; props: ComponentProps<EntryPage> };

  function setMainPage() {
    if (current?.page == "") {
      return;
    }

    current = {
      page: "",
      props: { idb },
    };
  }

  function setSettingsPage() {
    if (current?.page == "settings") {
      return;
    }

    current = {
      page: "settings",
      props: {},
    };
  }

  function setSurveyPage(id: number, subpage: "" | "entries" | "fields" | "matches" | "teams" | "options") {
    if (current?.page == "survey" && current.props.surveyRecord.id == id) {
      current.subpage = subpage;
      return;
    }

    if (current?.page == "entry") {
      current = {
        page: "survey",
        subpage,
        props: { idb, surveyRecord: current.props.surveyRecord },
      };
      return;
    }

    const surveyRequest = idb.transaction("surveys").objectStore("surveys").get(id);
    surveyRequest.onerror = () => setMainPage();

    surveyRequest.onsuccess = () => {
      const surveyRecord = surveyRequest.result;
      if (!surveyRecord) return setMainPage();

      if (!Array.isArray(surveyRecord.matches)) {
        surveyRecord.matches = [];
      }

      current = {
        page: "survey",
        subpage,
        props: { idb, surveyRecord },
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
      const entryRecord = entryRequest.result;
      if (!entryRecord) return setMainPage();

      if (!entryRecord.status) {
        entryRecord.status = "submitted";
      }

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
        const surveyRecord = surveyRequest.result;
        if (!surveyRecord) return setMainPage();

        if (!Array.isArray(surveyRecord.matches)) {
          surveyRecord.matches = [];
        }

        current = {
          page: "entry",
          props: { idb, surveyRecord, entryRecord },
        };
      };
    };
  }

  function handleHashChange() {
    const hash = location.hash.replace(/#\/?/, "").toLowerCase().trim().split("/");
    const page = hash[0] == "" || hash[0] == "settings" || hash[0] == "survey" || hash[0] == "entry" ? hash[0] : "";

    if (page == "") {
      setMainPage();
    } else if (page == "settings") {
      setSettingsPage();
    } else if (page == "survey") {
      const subpage =
        hash[2] == "" ||
        hash[2] == "entries" ||
        hash[2] == "fields" ||
        hash[2] == "matches" ||
        hash[2] == "teams" ||
        hash[2] == "options"
          ? hash[2]
          : "";
      const id = Number(hash[1]);
      if (Number.isNaN(id)) return setMainPage();
      setSurveyPage(id, subpage);
    } else if (page == "entry") {
      const id = Number(hash[1]);
      if (Number.isNaN(id)) return setMainPage();
      setEntryPage(id);
    }
  }

  function migrateSurveys(transaction: IDBTransaction) {
    const surveyStore = transaction.objectStore("surveys");

    const surveyCursor = surveyStore.openCursor();
    surveyCursor.onerror = () => {};

    surveyCursor.onsuccess = () => {
      const cursor = surveyCursor.result;
      if (!cursor) return;

      const survey = cursor.value as any;

      if (Array.isArray(survey.configs)) {
        survey.fields = survey.configs;
        for (const field of survey.fields) {
          if (Array.isArray(field.configs)) {
            field.fields = field.configs;
            delete field.configs;
          }
        }
        delete survey.configs;
      }

      if (Array.isArray(survey.entries)) {
        const entryStore = transaction.objectStore("entries");
        for (const entry of survey.entries) {
          entry.surveyId = cursor.key;
          entryStore.add(entry);
        }
        delete survey.entries;
      }

      cursor.update(survey);
      cursor.continue();
    };
  }

  function openIDB() {
    const request = indexedDB.open("MeanScout", 7);
    request.onerror = () => (idbError = `${request.error?.message}`);

    request.onupgradeneeded = (e) => {
      const storeNames = request.result.objectStoreNames;

      if (storeNames.contains("drafts")) {
        request.result.deleteObjectStore("drafts");
      }

      if (!storeNames.contains("entries")) {
        const entryStore = request.result.createObjectStore("entries", { keyPath: "id", autoIncrement: true });
        entryStore.createIndex("surveyId", "surveyId", { unique: false });
      }

      if (!storeNames.contains("surveys")) {
        request.result.createObjectStore("surveys", { keyPath: "id", autoIncrement: true });
      } else if (e.oldVersion < 6 && request.transaction) {
        migrateSurveys(request.transaction);
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

  persistStorage();
  openIDB();
</script>

{#if idbError}
  <Header />
  <Container padding="large">
    <h2>Error</h2>
    <p>
      MeanScout was unable to access IndexedDB. Double check that your device/browser supports it, and that you haven't
      removed the permission to access it.
    </p>
    <p>Error: {idbError}</p>
  </Container>
{:else if current?.page == ""}
  <MainPage {...current.props} />
{:else if current?.page == "settings"}
  <SettingsPage {...current.props} />
{:else if current?.page == "survey"}
  {#if current.subpage == ""}
    <SurveyPage {...current.props} />
  {:else if current.subpage == "entries"}
    <SurveyEntriesPage {...current.props} />
  {:else if current.subpage == "fields"}
    <SurveyFieldsPage {...current.props} />
  {:else if current.subpage == "matches"}
    <SurveyMatchesPage {...current.props} />
  {:else if current.subpage == "teams"}
    <SurveyTeamsPage {...current.props} />
  {:else if current.subpage == "options"}
    <SurveyOptionsPage {...current.props} />
  {/if}
{:else if current?.page == "entry"}
  <EntryPage {...current.props} />
{/if}
