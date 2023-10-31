import type { Entry, Survey } from "$lib";

export function openIDB() {
  return new Promise<{ surveyStore: SurveyStore; entryStore: EntryStore }>((resolve, reject) => {
    const request = indexedDB.open("MeanScout", 4);
    request.onerror = () => reject(request.error?.message);

    request.onupgradeneeded = () => {
      const storeNames = request.result.objectStoreNames;

      if (!storeNames.contains("surveys")) {
        request.result.createObjectStore("surveys", { keyPath: "id", autoIncrement: true });
      }

      if (!storeNames.contains("entries")) {
        const entryStore = request.result.createObjectStore("entries", { keyPath: "id", autoIncrement: true });
        entryStore.createIndex("surveyId", "surveyId", { unique: false });
      }
    };

    request.onsuccess = () => {
      if (!request.result) {
        reject("Could not open IDB");
        return;
      }

      resolve({
        surveyStore: new SurveyStore(request.result),
        entryStore: new EntryStore(request.result),
      });
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
      request.onerror = () => reject(options.rejectMessage);
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

  delete(id: number) {
    return this.adapter(this.idbStore().delete(id), {
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
      rejectMessage: `Could not count all entries with surveyId ${surveyId}`,
    });
  }

  deleteAllWithSurveyId(surveyId: number) {
    return new Promise<void>((resolve, reject) => {
      const cursorRequest = this.idbStore().index("surveyId").openCursor(surveyId);
      cursorRequest.onerror = () => reject(`Could not delete all entries with surveyId ${surveyId}`);
      cursorRequest.onsuccess = () => {
        const cursor = cursorRequest.result;
        if (cursor === undefined) {
          reject(`Could not delete all entries with surveyId ${surveyId}`);
        } else if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };
    });
  }

  async getEntryWithSurvey(entryId: number, surveyStore: SurveyStore) {
    const entryRecord = await this.get(entryId);
    const surveyRecord = await surveyStore.get(entryRecord.surveyId);
    return { surveyRecord, entryRecord };
  }
}
