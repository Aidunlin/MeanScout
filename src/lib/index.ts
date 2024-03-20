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

export type Match = {
  number: number;
  red1: string;
  red2: string;
  red3: string;
  blue1: string;
  blue2: string;
  blue3: string;
};

export type Survey = {
  name: string;
  fields: Field[];
  matches: Match[];
  teams: string[];
  created: Date;
  modified: Date;
};

export const entryStatuses = ["draft", "submitted", "exported"] as const;
export type EntryStatus = (typeof entryStatuses)[number];

export type Entry = {
  surveyId: number;
  status: EntryStatus;
  values: any[];
  created: Date;
  modified: Date;
};

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
  return fields.flatMap((field) => (field.type == "group" ? field.fields : field));
}

const API_URL = "https://www.thebluealliance.com/api/v3";

export async function fetchTBA(endpoint: string, tbaKey: string) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: [["X-TBA-Auth-Key", tbaKey]],
  });

  let data = await response.json();

  if (response.status == 200) {
    return { status: "success" as const, data };
  } else if (response.status == 401) {
    return { status: "unauthorized" as const, error: data.Error };
  } else if (response.status == 404) {
    return { status: "not found" as const };
  } else {
    return { status: "error" as const };
  }
}

export function persistStorage() {
  if (!navigator.storage) return;
  navigator.storage
    .persisted()
    .then((isPersisted) => {
      if (isPersisted) return;
      navigator.storage.persist().catch(console.error);
    })
    .catch(console.error);
}

export function download(data: string, name: string, type: string) {
  const blob = new Blob([data], { type });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.download = name.replaceAll(" ", "_");
  anchor.href = url;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export function share(data: string, name: string, type: string) {
  const file = new File([data], name.replaceAll(" ", "_"), { type });
  navigator.share({ files: [file], title: file.name });
}
