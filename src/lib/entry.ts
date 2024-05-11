import { valueSchema } from "$lib";
import { z } from "zod";

export const entryStatuses = ["draft", "submitted", "exported"] as const;
export type EntryStatus = (typeof entryStatuses)[number];

const baseEntrySchema = z.object({
  surveyId: z.number(),
  status: z.enum(entryStatuses),
  team: z.string(),
  values: z.array(valueSchema),
  created: z.date(),
  modified: z.date(),
});

const matchEntrySchema = baseEntrySchema.merge(
  z.object({
    type: z.literal("match"),
    match: z.number(),
    absent: z.boolean(),
  }),
);
export type MatchEntry = z.infer<typeof matchEntrySchema>;

const pitEntrySchema = baseEntrySchema.merge(
  z.object({
    type: z.literal("pit"),
  }),
);
export type PitEntry = z.infer<typeof pitEntrySchema>;

const entrySchema = z.discriminatedUnion("type", [matchEntrySchema, pitEntrySchema]);
export type Entry = z.infer<typeof entrySchema>;

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
