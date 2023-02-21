import type { PageLoad } from "./$types";

export const load = (({ params }) => {
  return {
    surveyIndex: parseInt(params.survey),
  };
}) satisfies PageLoad;
