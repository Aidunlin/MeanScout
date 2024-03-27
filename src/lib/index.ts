import type { Field } from "$lib/field";

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
  tbaEventKey?: string | undefined;
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
  console.log(anchor.toString());

  URL.revokeObjectURL(url);
}

export function shareAsFile(data: string, name: string, type: string) {
  const file = new File([data], name, { type });
  navigator.share({ files: [file], title: file.name });
}

export function shareAsText(data: string, name: string) {
  navigator.share({ text: data, title: name });
}
