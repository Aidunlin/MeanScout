import type { PageLoad } from "./$types";

export const load = (({ params }) => {
  return {
    surveyIndex: parseInt(params.surveyIndex),
    entryIndex: parseInt(params.entryIndex),
  };
}) satisfies PageLoad;
