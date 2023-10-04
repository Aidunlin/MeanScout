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
  id?: number;
  name: string;
  configs: MetricConfig[];
  teams: string[];
  entries: Entry[];
  created: Date;
  modified: Date;
};

export function openIDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("MeanScout", 3);
    request.onerror = (event: any) => reject(event.target.error);
    request.onupgradeneeded = () => {
      const idb = request.result;
      const storeNames = idb.objectStoreNames;
      if (storeNames.contains("MeanScout")) {
        idb.deleteObjectStore("MeanScout");
      }
      if (!storeNames.contains("surveys")) {
        idb.createObjectStore("surveys", { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => {
      if (request.result) resolve(request.result);
      else reject("Could not open IDB");
    };
  });
}

type SurveyStoreAdapterOptions = {
  rejectMessage: string;
  shouldResultUndefined?: boolean;
};

export class SurveyStore {
  idb: IDBDatabase;

  constructor(idb: IDBDatabase) {
    this.idb = idb;
  }

  idbStore() {
    return this.idb.transaction("surveys", "readwrite").objectStore("surveys");
  }

  adapter<T>(request: IDBRequest<T>, options: SurveyStoreAdapterOptions) {
    return new Promise<T>((resolve, reject) => {
      request.onerror = (event: any) => reject(event.target.error);
      request.onsuccess = () => {
        if (!options.shouldResultUndefined && request.result == undefined) reject(options.rejectMessage);
        else resolve(request.result);
      };
    });
  }

  getAll() {
    return this.adapter<Survey[]>(this.idbStore().getAll(), {
      rejectMessage: "Could not get surveys",
    });
  }

  get(surveyId: number) {
    return this.adapter<Survey>(this.idbStore().get(surveyId), {
      rejectMessage: `Could not get survey ${surveyId}`,
    });
  }

  add(survey: Survey) {
    return this.adapter(this.idbStore().add(survey), { rejectMessage: `Could not add survey ${survey.name}` });
  }

  put(survey: Survey) {
    return this.adapter(this.idbStore().put(survey), { rejectMessage: `Could not put survey ${survey.name}` });
  }

  delete(surveyId: number) {
    return this.adapter(this.idbStore().delete(surveyId), {
      rejectMessage: `Could not delete survey ${surveyId}`,
      shouldResultUndefined: true,
    });
  }
}

export const target = writable<Target>((localStorage.getItem("target") as Target) || "red");
target.subscribe((value) => {
  localStorage.setItem("target", value);
  const newTheme = value == "pit" ? "orange" : value.split(" ")[0];
  document.documentElement.style.setProperty("--theme-color", `var(--${newTheme})`);
});

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
