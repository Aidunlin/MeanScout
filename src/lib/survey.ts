import type { Match } from "./";
import type { Expression, PickList } from "./analysis";
import type { Field } from "./field";

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
