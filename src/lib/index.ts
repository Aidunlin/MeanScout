import type Dialog from "./components/Dialog.svelte";

export const fieldTypes = ["team", "match", "toggle", "number", "select", "text", "rating", "timer", "group"] as const;
export type FieldType = (typeof fieldTypes)[number];

type BaseField<T extends FieldType> = {
  name: string;
  type: T;
};

type TeamField = BaseField<"team">;
type MatchField = BaseField<"match">;
type ToggleField = BaseField<"toggle">;
type NumberField = BaseField<"number"> & { allowNegative?: boolean };
type SelectField = BaseField<"select"> & { values: string[] };
type TextField = BaseField<"text"> & { long?: boolean; tip?: string };
type RatingField = BaseField<"rating">;
type TimerField = BaseField<"timer">;
type GroupField = BaseField<"group"> & { fields: Exclude<Field, GroupField>[] };

export type Field =
  | TeamField
  | MatchField
  | ToggleField
  | NumberField
  | SelectField
  | TextField
  | RatingField
  | TimerField
  | GroupField;

export type Survey = {
  name: string;
  fields: Field[];
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

export type DialogDataType<T> = { dialog?: Dialog; data: T };

export function getDefaultFieldValue(field: Exclude<Field, GroupField>) {
  switch (field.type) {
    case "team":
      return "";
    case "match":
      return 1;
    case "toggle":
      return false;
    case "number":
      return 0;
    case "select":
      return field.values[0];
    case "text":
      return "";
    case "rating":
      return 0;
    case "timer":
      return 0;
    default:
      const unhandledType: never = field;
      throw new Error(`Unhandled type for field ${unhandledType}`);
  }
}

export function flattenFields(fields: Field[]) {
  return fields
    .map((field) => {
      if (field.type == "group") {
        return field.fields;
      } else {
        return field;
      }
    })
    .flat();
}
