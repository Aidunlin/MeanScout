import type { Entry, IDBRecord, Survey } from "$lib";

declare global {
  // See https://kit.svelte.dev/docs/types#app
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }

  interface IDBCursorWithTypedValue<T> extends IDBCursorWithValue {
    update(value: T): IDBRequest<IDBValidKey | undefined>;
    readonly value: IDBRecord<T>;
  }

  interface IDBStore<T> extends IDBObjectStore {
    add(value: T, key?: IDBValidKey): IDBRequest<IDBValidKey | undefined>;
    get(query: IDBValidKey | IDBKeyRange): IDBRequest<IDBRecord<T> | undefined>;
    getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<IDBRecord<T>[] | undefined>;
    openCursor(
      query?: IDBValidKey | IDBKeyRange | null,
      direction?: IDBCursorDirection,
    ): IDBRequest<IDBCursorWithTypedValue<T> | null | undefined>;
    put(value: T, key?: IDBValidKey): IDBRequest<IDBValidKey | undefined>;
  }

  interface IDBTransaction {
    objectStore(name: "surveys"): IDBStore<Survey>;
    objectStore(name: "entries" | "drafts"): IDBStore<Entry>;
  }
}

export {};
