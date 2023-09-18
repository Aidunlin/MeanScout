import { writable, type Writable } from "svelte/store";

export const allianceTargets = ["red", "blue"] as const;
export type AllianceTarget = (typeof allianceTargets)[number];

export const redTeamTargets = ["red 1", "red 2", "red 3"] as const;
export type RedTeamTarget = (typeof redTeamTargets)[number];

export const blueTeamTargets = ["blue 1", "blue 2", "blue 3"] as const;
export type BlueTeam = (typeof blueTeamTargets)[number];

export const otherTargets = ["pit"] as const;
export type OtherTarget = (typeof otherTargets)[number];

export const targets = [...allianceTargets, ...redTeamTargets, ...blueTeamTargets, ...otherTargets] as const;
export type Target = (typeof targets)[number];

export const metricTypes = ["team", "match", "toggle", "number", "select", "text", "rating", "timer"] as const;
export type MetricType = (typeof metricTypes)[number];

type BaseConfig = {
  name: string;
  type: MetricType;
  group?: string;
  required?: boolean;
};

interface TeamConfig extends BaseConfig {
  type: "team";
}

interface MatchConfig extends BaseConfig {
  type: "match";
}

interface ToggleConfig extends BaseConfig {
  type: "toggle";
}

interface NumberConfig extends BaseConfig {
  type: "number";
}

interface SelectConfig extends BaseConfig {
  type: "select";
  values: string[];
}

interface TextConfig extends BaseConfig {
  type: "text";
  long?: boolean;
  tip?: string;
}

interface RatingConfig extends BaseConfig {
  type: "rating";
}

interface TimerConfig extends BaseConfig {
  type: "timer";
}

interface MetricConfigTypeMap {
  team: TeamConfig;
  match: MatchConfig;
  toggle: ToggleConfig;
  number: NumberConfig;
  select: SelectConfig;
  text: TextConfig;
  rating: RatingConfig;
  timer: TimerConfig;
}

export type MetricConfig = MetricConfigTypeMap[MetricType];

export type Entry = {
  values: any[];
  created: Date;
  modified: Date;
};

export type Survey = {
  name: string;
  configs: MetricConfig[];
  teams: string[];
  entries: Entry[];
  created: Date;
  modified: Date;
};

export const surveys = writable<Survey[]>([]);
export const target = writable<Target>("red");

function getObjectStore(idb: IDBDatabase) {
  return idb.transaction("MeanScout", "readwrite").objectStore("MeanScout");
}

function setupIDBStore<T>(
  svelteStore: Writable<T>,
  name: string,
  start: T,
  objectStore: IDBObjectStore,
  subscriber?: (value: T) => void
) {
  const idb = objectStore.transaction.db;
  const getData = objectStore.get(name);

  function addSubscriber() {
    svelteStore.subscribe((value) => {
      getObjectStore(idb).put(value, name);
      if (subscriber) subscriber(value);
    });
  }

  getData.onerror = () => {
    getObjectStore(idb).add(start, name);
    addSubscriber();
  };

  getData.onsuccess = () => {
    if (getData.result == undefined) {
      getObjectStore(idb).put(start, name);
    } else {
      svelteStore.set(getData.result);
    }
    addSubscriber();
  };
}

const openIDBRequest = indexedDB.open("MeanScout");
openIDBRequest.onerror = (event: any) => console.error(event.target.error);
openIDBRequest.onupgradeneeded = () => openIDBRequest.result.createObjectStore("MeanScout");

openIDBRequest.onsuccess = () => {
  const idb = openIDBRequest.result;
  const objectStore = getObjectStore(idb);

  setupIDBStore(surveys, "surveys", [], objectStore);
  setupIDBStore(target, "target", "red", objectStore, (target) => {
    const newTheme = target == "pit" ? "yellow" : target.split(" ")[0];
    document.documentElement.style.setProperty("--theme-color", `var(--${newTheme})`);
  });
};

export function getMetricDefaultValue(config: MetricConfig) {
  switch (config.type) {
    case "team":
      return "";
    case "match":
      return 1;
    case "toggle":
      return false;
    case "number":
      return 0;
    case "select":
      return config.values[0];
    case "text":
      return "";
    case "rating":
      return 0;
    case "timer":
      return 0;
    default:
      return undefined;
  }
}

export function getHighestMatchValue(survey: Survey) {
  let highest = 0;

  survey.entries.forEach((entry) => {
    entry.values.forEach((value, i) => {
      if (survey.configs[i].type == "match") {
        highest = Math.max(value, highest);
      }
    });
  });

  return highest;
}
