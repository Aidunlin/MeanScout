import type { Entry, Survey } from "$lib";

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
    request.onerror = () => reject(request.error?.message);

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

export type IDBRecord<T> = T & { id: number };

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

export async function getEntryWithSurvey(entryId: number, surveyStore: SurveyStore, entryStore: EntryStore) {
  const entryRecord = await entryStore.get(entryId);
  const surveyRecord = await surveyStore.get(entryRecord.id);
  return { surveyRecord, entryRecord };
}
