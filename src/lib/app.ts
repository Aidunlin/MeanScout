import { writable } from "svelte/store";

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

export const metricTypes = ["team", "match", "toggle", "number", "select", "text", "rating", "timer", "group"] as const;
export type MetricType = (typeof metricTypes)[number];

type BaseConfig<T extends MetricType> = {
  name: string;
  type: T;
};

type TeamConfig = BaseConfig<"team">;
type MatchConfig = BaseConfig<"match">;
type ToggleConfig = BaseConfig<"toggle">;
type NumberConfig = BaseConfig<"number"> & { allowNegative?: boolean };
type SelectConfig = BaseConfig<"select"> & { values: string[] };
type TextConfig = BaseConfig<"text"> & { long?: boolean; tip?: string };
type RatingConfig = BaseConfig<"rating">;
type TimerConfig = BaseConfig<"timer">;
type GroupConfig = BaseConfig<"group"> & { configs: Exclude<MetricConfig, GroupConfig>[] };

export type MetricConfig =
  | TeamConfig
  | MatchConfig
  | ToggleConfig
  | NumberConfig
  | SelectConfig
  | TextConfig
  | RatingConfig
  | TimerConfig
  | GroupConfig;

export type Survey = {
  name: string;
  configs: MetricConfig[];
  teams: string[];
  created: Date;
  modified: Date;
};

export type Entry = {
  surveyId: number;
  values: any[];
  created: Date;
  modified: Date;
};

export type IDBRecord<T> = T & { id: number };

async function migrateEntries(idb: IDBDatabase) {
  const transaction = idb.transaction(["surveys", "entries"], "readwrite");
  const surveyStore = transaction.objectStore("surveys");
  const entryStore = transaction.objectStore("entries");

  const surveys = await new Promise<any[]>((resolve, reject) => {
    const request = surveyStore.getAll();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });

  for (const survey of surveys) {
    if (!Array.isArray(survey.entries)) {
      continue;
    }

    for (const entry of survey.entries) {
      entryStore.add({
        surveyId: survey.id,
        values: entry.values,
        created: entry.created,
        modified: entry.modified,
      });
    }

    delete survey.entries;
    surveyStore.put(survey);
  }
}

export function openIDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("MeanScout", 4);
    request.onerror = () => reject(request.error);

    request.onupgradeneeded = async () => {
      const idb = request.result;
      const storeNames = idb.objectStoreNames;
      const alreadySurveys = storeNames.contains("surveys");
      const alreadyEntries = storeNames.contains("entries");

      if (!alreadySurveys) {
        idb.createObjectStore("surveys", { keyPath: "id", autoIncrement: true });
      }

      if (!alreadyEntries) {
        const entryStore = idb.createObjectStore("entries", { keyPath: "id", autoIncrement: true });
        entryStore.createIndex("surveyId", "surveyId", { unique: false });
      }

      if (alreadySurveys && !alreadyEntries) {
        await migrateEntries(idb);
      }
    };

    request.onsuccess = () => {
      if (request.result) resolve(request.result);
      else reject("Could not open IDB");
    };
  });
}

type AdapterStoreOptions = {
  rejectMessage: string;
  shouldResultUndefined?: boolean;
};

class AdapterStore<T> {
  idb: IDBDatabase;
  storeName: string;

  constructor(idb: IDBDatabase, storeName: string) {
    this.idb = idb;
    this.storeName = storeName;
  }

  idbStore() {
    return this.idb.transaction(this.storeName, "readwrite").objectStore(this.storeName);
  }

  adapter<U>(request: IDBRequest<U>, options: AdapterStoreOptions) {
    return new Promise<U>((resolve, reject) => {
      request.onerror = () => reject(options.rejectMessage || request.error);
      request.onsuccess = () => {
        if (request.result !== undefined || options.shouldResultUndefined) {
          resolve(request.result);
        } else {
          reject(options.rejectMessage);
        }
      };
    });
  }

  getAll() {
    return this.adapter<IDBRecord<T>[]>(this.idbStore().getAll(), {
      rejectMessage: `Could not get all records from ${this.storeName}`,
    });
  }

  get(id: number) {
    return this.adapter<IDBRecord<T>>(this.idbStore().get(id), {
      rejectMessage: `Could not get record ${id} from ${this.storeName}`,
    });
  }

  add(record: T) {
    return this.adapter(this.idbStore().add(record) as IDBRequest<number>, {
      rejectMessage: `Could not add record ${JSON.stringify(record)} to ${this.storeName}`,
    });
  }

  put(record: T | IDBRecord<T>) {
    return this.adapter(this.idbStore().put(record) as IDBRequest<number>, {
      rejectMessage: `Could not put record ${JSON.stringify(record)} to ${this.storeName}`,
    });
  }

  async delete(id: number) {
    await this.adapter(this.idbStore().delete(id), {
      rejectMessage: `Could not delete record ${id} from ${this.storeName}`,
      shouldResultUndefined: true,
    });
  }
}

export class SurveyStore extends AdapterStore<Survey> {
  constructor(idb: IDBDatabase) {
    super(idb, "surveys");
  }
}

export class EntryStore extends AdapterStore<Entry> {
  constructor(idb: IDBDatabase) {
    super(idb, "entries");
  }

  getAllWithSurveyId(surveyId: number) {
    const index = this.idbStore().index("surveyId");
    return this.adapter<IDBRecord<Entry>[]>(index.getAll(surveyId), {
      rejectMessage: `Could not get all entries with surveyId ${surveyId}`,
    });
  }

  countWithSurveyId(surveyId: number) {
    const index = this.idbStore().index("surveyId");
    return this.adapter(index.count(surveyId), {
      rejectMessage: `Could not get all entries with surveyId ${surveyId}`,
    });
  }

  async deleteAllWithSurveyId(surveyId: number) {
    const entries = await this.getAllWithSurveyId(surveyId);
    const promises = [];

    for (const entry of entries) {
      promises.push(this.delete(entry.id));
    }

    return await Promise.all(promises);
  }
}

export async function getStores() {
  const idb = await openIDB();
  return {
    surveyStore: new SurveyStore(idb),
    entryStore: new EntryStore(idb),
  };
}

export const target = writable<Target>((localStorage.getItem("target") as Target) || "red");
target.subscribe((value) => {
  localStorage.setItem("target", value);
  const newTheme = value == "pit" ? "orange" : value.split(" ")[0];
  document.documentElement.style.setProperty("--theme-color", `var(--${newTheme})`);
});

export function getMetricDefaultValue(config: Exclude<MetricConfig, GroupConfig>) {
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
      const unhandledType: never = config;
      throw new Error(`Unhandled type for config ${unhandledType}`);
  }
}

export function flattenConfigs(configs: MetricConfig[]) {
  return configs
    .map((config) => {
      if (config.type == "group") {
        return config.configs;
      } else {
        return config;
      }
    })
    .flat();
}

export function getHighestMatchValue(entries: Entry[], ungroupedConfigs: Exclude<MetricConfig, GroupConfig>[]) {
  let highest = 0;

  entries.forEach((entry) => {
    entry.values.forEach((value, i) => {
      if (ungroupedConfigs[i].type == "match") {
        highest = Math.max(value, highest);
      }
    });
  });

  return highest;
}
