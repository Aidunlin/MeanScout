import type { Field } from "$lib/field";
import type { Expression, PickList } from "$lib/analysis";

export type Match = {
  number: number;
  red1: string;
  red2: string;
  red3: string;
  blue1: string;
  blue2: string;
  blue3: string;
};

export const surveyTypes = ["match", "pit"] as const;
export type SurveyType = (typeof surveyTypes)[number];

type BaseSurvey<T extends SurveyType> = {
  name: string;
  type: T;
  tbaEventKey?: string | undefined;
  fields: Field[];
  teams: string[];
  expressions: Expression[];
  pickLists: PickList[];
  created: Date;
  modified: Date;
};

export type MatchSurvey = BaseSurvey<"match"> & { matches: Match[] };
export type PitSurvey = BaseSurvey<"pit">;

export type Survey = MatchSurvey | PitSurvey;

export const entryStatuses = ["draft", "submitted", "exported"] as const;
export type EntryStatus = (typeof entryStatuses)[number];

type BaseEntry<T extends SurveyType> = {
  surveyId: number;
  type: T;
  status: EntryStatus;
  values: any[];
  created: Date;
  modified: Date;
};

export type MatchEntry = BaseEntry<"match"> & { team: string; match: number; absent: boolean };
export type PitEntry = BaseEntry<"pit"> & { team: string };

export type Entry = MatchEntry | PitEntry;

export function parseValueFromString(value: any) {
  if (typeof value !== "string") return value;

  if (value.toLowerCase() == "true") {
    return true;
  } else if (value.toLowerCase() == "false") {
    return false;
  } else if (value == "") {
    return "";
  } else if (!Number.isNaN(Number(value))) {
    return Number(value);
  }

  return value;
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
  anchor.download = name;
  anchor.href = url;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

export function shareAsFile(data: string, name: string, type: string) {
  const file = new File([data], name, { type });
  navigator.share({ files: [file], title: file.name });
}

export function shareAsText(data: string, name: string) {
  navigator.share({ text: data, title: name });
}
