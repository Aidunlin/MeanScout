import type { Entry } from "./entry";
import type { Target } from "./settings";
import type { Survey } from "./survey";

export type Match = {
  number: number;
  red1: string;
  red2: string;
  red3: string;
  blue1: string;
  blue2: string;
  blue3: string;
};

export function createEntryFileName(survey: Survey, entry: Entry | Entry[], target?: Target) {
  if (Array.isArray(entry)) {
    if (target) {
      var fileName = `${survey.name}-entries-${target}.csv`;
    } else {
      var fileName = `${survey.name}-entries.csv`;
    }
  } else if (entry.type == "match") {
    var fileName = `${survey.name}-entry-${entry.team}-${entry.match}-${entry.absent}.csv`;
  } else {
    var fileName = `${survey.name}-entry-${entry.team}.csv`;
  }

  return fileName.replaceAll(" ", "_");
}

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
