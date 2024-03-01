import type { Entry, Survey } from "$lib";

declare global {
  // See https://kit.svelte.dev/docs/types#app
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface Platform {}
  }

  type IDBRecord<T> = T & { id: number };

  interface IDBCursorWithTypedValue<T> extends IDBCursorWithValue {
    update(value: T): IDBRequest<IDBValidKey | undefined>;
    readonly value: IDBRecord<T>;
  }

  interface IDBIndexWithTypedValue<T> extends IDBIndex {
    readonly objectStore: IDBStore<T>;
    add(value: T & { id?: number | undefined }, key?: IDBValidKey): IDBRequest<IDBValidKey | undefined>;
    get(query: IDBValidKey | IDBKeyRange): IDBRequest<IDBRecord<T> | undefined>;
    getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<IDBRecord<T>[] | undefined>;
    openCursor(
      query?: IDBValidKey | IDBKeyRange | null,
      direction?: IDBCursorDirection,
    ): IDBRequest<IDBCursorWithTypedValue<T> | null | undefined>;
    put(value: T & { id?: number | undefined }, key?: IDBValidKey): IDBRequest<IDBValidKey | undefined>;
  }

  interface IDBStore<T> extends IDBObjectStore {
    add(value: T & { id?: number | undefined }, key?: IDBValidKey): IDBRequest<IDBValidKey | undefined>;
    get(query: IDBValidKey | IDBKeyRange): IDBRequest<IDBRecord<T> | undefined>;
    getAll(query?: IDBValidKey | IDBKeyRange | null, count?: number): IDBRequest<IDBRecord<T>[] | undefined>;
    index(name: T extends Entry ? "surveyId" : string): IDBIndexWithTypedValue<T>;
    openCursor(
      query?: IDBValidKey | IDBKeyRange | null,
      direction?: IDBCursorDirection,
    ): IDBRequest<IDBCursorWithTypedValue<T> | null | undefined>;
    put(value: T & { id?: number | undefined }, key?: IDBValidKey): IDBRequest<IDBValidKey | undefined>;
  }

  interface IDBTransaction {
    objectStore(name: "surveys"): IDBStore<Survey>;
    objectStore(name: "entries"): IDBStore<Entry>;
  }

  interface IDBDatabase {
    transaction(
      storeNames: "surveys" | "entries" | ("surveys" | "entries")[],
      mode?: IDBTransactionMode,
      options?: IDBTransactionOptions,
    ): IDBTransaction;
  }
}

export {};
