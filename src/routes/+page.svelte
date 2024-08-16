<script lang="ts">
  import { persistStorage } from "$lib";
  import Container from "$lib/components/Container.svelte";
  import Header from "$lib/components/Header.svelte";
  import type { Entry } from "$lib/entry";
  import { fieldTypes, flattenFields, type Field } from "$lib/field";
  import "$lib/global.css";
  import type { MatchSurvey } from "$lib/survey";
  import type { ComponentProps } from "svelte";
  import AboutPage from "./about/AboutPage.svelte";
  import EntryPage from "./entry/EntryPage.svelte";
  import MainPage from "./main/MainPage.svelte";
  import SettingsPage from "./settings/SettingsPage.svelte";
  import SurveyPage from "./survey/SurveyPage.svelte";
  import SurveyAnalysisPage from "./survey/analysis/SurveyAnalysisPage.svelte";
  import SurveyEntriesPage from "./survey/entries/SurveyEntriesPage.svelte";
  import SurveyFieldsPage from "./survey/fields/SurveyFieldsPage.svelte";
  import SurveyMatchesPage from "./survey/matches/SurveyMatchesPage.svelte";
  import SurveyOptionsPage from "./survey/options/SurveyOptionsPage.svelte";
  import SurveyTeamsPage from "./survey/teams/SurveyTeamsPage.svelte";

  let idbError = $state("");
  let idb: IDBDatabase;

  type CurrentPage =
    | undefined
    | { page: ""; props: ComponentProps<MainPage> }
    | { page: "settings"; props: ComponentProps<SettingsPage> }
    | { page: "about"; props: ComponentProps<AboutPage> }
    | { page: "survey"; subpage: ""; props: ComponentProps<SurveyPage> }
    | { page: "survey"; subpage: "entries"; props: ComponentProps<SurveyEntriesPage> }
    | { page: "survey"; subpage: "analysis"; props: ComponentProps<SurveyAnalysisPage> }
    | { page: "survey"; subpage: "fields"; props: ComponentProps<SurveyFieldsPage> }
    | { page: "survey"; subpage: "matches"; props: ComponentProps<SurveyMatchesPage> }
    | { page: "survey"; subpage: "teams"; props: ComponentProps<SurveyTeamsPage> }
    | { page: "survey"; subpage: "options"; props: ComponentProps<SurveyOptionsPage> }
    | { page: "entry"; props: ComponentProps<EntryPage> };

  let current = $state<CurrentPage>(undefined);

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

  function setAboutPage() {
    if (current?.page == "about") {
      return;
    }

    current = {
      page: "about",
      props: {},
    };
  }

  function setSurveyPage(
    id: number,
    subpage: "" | "entries" | "analysis" | "fields" | "matches" | "teams" | "options",
  ) {
    if (current?.page == "survey" && current.props.surveyRecord.id == id) {
      current.subpage = subpage;
      return;
    }

    if (current?.page == "entry") {
      if (subpage == "analysis" || subpage == "matches") {
        current = {
          page: "survey",
          subpage,
          props: { idb, surveyRecord: current.props.surveyRecord as IDBRecord<MatchSurvey> },
        };
        return;
      }

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

      if (!surveyRecord.expressions) {
        surveyRecord.expressions = [];
      }

      if (!surveyRecord.pickLists) {
        surveyRecord.pickLists = [];
      }

      if (subpage == "analysis" || subpage == "matches") {
        current = {
          page: "survey",
          subpage,
          props: { idb, surveyRecord: surveyRecord as IDBRecord<MatchSurvey> },
        };
        return;
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

        if (!surveyRecord.expressions) {
          surveyRecord.expressions = [];
        }

        if (!surveyRecord.pickLists) {
          surveyRecord.pickLists = [];
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
    const page =
      hash[0] == "" || hash[0] == "settings" || hash[0] == "about" || hash[0] == "survey" || hash[0] == "entry"
        ? hash[0]
        : "";

    if (page == "") {
      setMainPage();
    } else if (page == "settings") {
      setSettingsPage();
    } else if (page == "about") {
      setAboutPage();
    } else if (page == "survey") {
      const subpage =
        hash[2] == "" ||
        hash[2] == "entries" ||
        hash[2] == "analysis" ||
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

  function migrateEntries(entryStore: IDBStore<Entry>, surveyId: number, flattenedFields: any[]) {
    const entryCursorRequest = entryStore.index("surveyId").openCursor(surveyId);
    entryCursorRequest.onerror = () => {};

    entryCursorRequest.onsuccess = () => {
      const entryCursor = entryCursorRequest.result;
      if (!entryCursor) return;

      const entry = entryCursor.value as any;

      if (!entry.type) {
        entry.type = "match";
      }

      flattenedFields.forEach((field, i) => {
        if (field.type == "team") {
          entry.team = entry.values[i];
          entry.values.splice(i, 1);
        }

        if (entry.type == "match") {
          if (field.type == "match") {
            entry.match = entry.values[i];
            entry.values.splice(i, 1);
          }

          if (field.type == "toggle" && field.name == "Absent") {
            entry.absent = entry.values[i];
            entry.values.splice(i, 1);
          }
        }
      });

      if (!entry.team) {
        entry.team = "";
      }

      if (entry.type == "match") {
        if (!entry.match) {
          entry.match = 1;
        }

        if (!entry.absent) {
          entry.absent = false;
        }
      }

      entryCursor.update(entry);
      entryCursor.continue();
    };
  }

  function migrateFields<T extends Field>(fields: T[]) {
    return fields
      .map((field) => {
        if (field.type == "group") {
          field.fields = migrateFields(field.fields);
        }
        return field;
      })
      .filter((field) => fieldTypes.includes(field.type) && !(field.type == "toggle" && field.name == "Absent"));
  }

  function migrateSurveys(transaction: IDBTransaction) {
    const surveyStore = transaction.objectStore("surveys");
    const entryStore = transaction.objectStore("entries");

    const surveyCursorRequest = surveyStore.openCursor();
    surveyCursorRequest.onerror = () => {};

    surveyCursorRequest.onsuccess = () => {
      const surveyCursor = surveyCursorRequest.result;
      if (!surveyCursor) return;

      const survey = surveyCursor.value as any;

      if (!survey.type) {
        survey.type = "match";
      }

      if (survey.type == "match" && !Array.isArray(survey.matches)) {
        survey.matches = [];
      }

      migrateEntries(entryStore, survey.id, flattenFields(survey.fields));

      survey.fields = migrateFields(survey.fields);

      if (!survey.expressions) {
        survey.expressions = [];
      }

      if (!survey.pickLists) {
        survey.pickLists = [];
      }

      surveyCursor.update(survey);
      surveyCursor.continue();
    };
  }

  function openIDB() {
    const request = indexedDB.open("MeanScout", 8);
    request.onerror = () => (idbError = `${request.error?.message}`);

    request.onupgradeneeded = (e) => {
      const storeNames = request.result.objectStoreNames;

      if (!storeNames.contains("entries")) {
        const entryStore = request.result.createObjectStore("entries", { keyPath: "id", autoIncrement: true });
        entryStore.createIndex("surveyId", "surveyId", { unique: false });
      } else if (request.transaction) {
        const entryStore = request.transaction.objectStore("entries");
        if (!entryStore.indexNames.contains("surveyId")) {
          entryStore.createIndex("surveyId", "surveyId", { unique: false });
        }
      }

      if (!storeNames.contains("surveys")) {
        request.result.createObjectStore("surveys", { keyPath: "id", autoIncrement: true });
      }

      if (e.oldVersion < 8 && request.transaction) {
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
{:else if current?.page == "about"}
  <AboutPage {...current.props} />
{:else if current?.page == "survey"}
  {#if current.subpage == ""}
    <SurveyPage {...current.props} />
  {:else if current.subpage == "entries"}
    <SurveyEntriesPage {...current.props} />
  {:else if current.subpage == "analysis"}
    <SurveyAnalysisPage {...current.props} />
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
