import type { SurveyType } from "./survey";

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

export function valueAsCSV(value: any) {
  return value.toString().replaceAll(",", "").replaceAll("\n", ". ").trim();
}

export function entryAsCSV(entry: Entry) {
  const mainValues = [valueAsCSV(entry.team)];
  if (entry.type == "match") {
    mainValues.push(valueAsCSV(entry.match), valueAsCSV(entry.absent));
  }
  return [...mainValues, ...entry.values.map(valueAsCSV)].join(",");
}
