import type { PageLoad } from "./$types";

export const load = (({ params }) => {
  return {
    surveyIndex: parseInt(params.survey),
    entryIndex: parseInt(params.entry),
  };
}) satisfies PageLoad;
