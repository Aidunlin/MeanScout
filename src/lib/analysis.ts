import { valueSchema } from "$lib";
import { z } from "zod";
import type { Entry } from "./entry";

const fieldAsExpressionInputSchema = z.object({ from: z.literal("field"), fieldIndex: z.number() });
export type FieldAsExpressionInput = z.infer<typeof fieldAsExpressionInputSchema>;

const expressionAsExpressionInputSchema = z.object({ from: z.literal("expression"), expressionName: z.string() });
export type ExpressionAsExpressionInput = z.infer<typeof expressionAsExpressionInputSchema>;

const expressionInputSchema = z.discriminatedUnion("from", [
  fieldAsExpressionInputSchema,
  expressionAsExpressionInputSchema,
]);
export type ExpressionInput = z.infer<typeof expressionInputSchema>;

const baseExpressionSchema = z.object({
  name: z.string(),
  inputs: z.array(expressionInputSchema).nonempty(),
});

export const reduceExpressionTypes = ["average", "min", "max", "sum", "count"] as const;

const reduceExpressionSchema = z.discriminatedUnion("type", [
  baseExpressionSchema.merge(z.object({ type: z.literal("average") })),
  baseExpressionSchema.merge(z.object({ type: z.literal("min") })),
  baseExpressionSchema.merge(z.object({ type: z.literal("max") })),
  baseExpressionSchema.merge(z.object({ type: z.literal("sum") })),
  baseExpressionSchema.merge(z.object({ type: z.literal("count"), valueToCount: valueSchema })),
]);
export type ReduceExpression = z.infer<typeof reduceExpressionSchema>;

export const mapExpressionTypes = ["convert", "multiply", "divide", "abs"] as const;

const convertExpressionSchema = baseExpressionSchema.merge(
  z.object({
    type: z.literal("convert"),
    converters: z.array(z.object({ from: valueSchema, to: valueSchema })),
    defaultTo: valueSchema,
  }),
);
export type ConvertExpression = z.infer<typeof convertExpressionSchema>;

const divisorSchema = z.number().gt(0).or(z.number().lt(0));

const mapExpressionSchema = z.discriminatedUnion("type", [
  convertExpressionSchema,
  baseExpressionSchema.merge(z.object({ type: z.literal("multiply"), multiplier: z.number().finite() })),
  baseExpressionSchema.merge(z.object({ type: z.literal("divide"), divisor: divisorSchema })),
  baseExpressionSchema.merge(z.object({ type: z.literal("abs") })),
]);
export type MapExpression = z.infer<typeof mapExpressionSchema>;

export const expressionSchema = z.discriminatedUnion("type", [
  ...reduceExpressionSchema.options,
  ...mapExpressionSchema.options,
]);
export type Expression = z.infer<typeof expressionSchema>;

export const pickListSchema = z.object({
  name: z.string(),
  weights: z.array(z.object({ expressionName: z.string(), percentage: z.number() })),
});
export type PickList = z.infer<typeof pickListSchema>;

export function calculateTeamData(
  expressionName: string,
  expressions: Expression[],
  entriesByTeam: Record<string, IDBRecord<Entry>[]>,
) {
  const teamData: Record<string, number> = {};
  for (const team in entriesByTeam) {
    let value = runExpression(team, expressionName, expressions, entriesByTeam[team]);
    if (Array.isArray(value)) {
      value = value.reduce((prev, curr) => prev + curr, 0) / value.length;
    }
    teamData[team] = value;
  }
  return teamData;
}

export function normalizeTeamData(teamData: Record<string, number>, percentage = 100) {
  const bestValue = Math.max(...Object.values(teamData));
  const normalizedTeamData: Record<string, number> = {};
  for (const team in teamData) {
    if (bestValue == 0) {
      normalizedTeamData[team] = 0;
    } else {
      normalizedTeamData[team] = (teamData[team] / bestValue) * percentage;
    }
  }
  return normalizedTeamData;
}

export function getExpressionInput(team: string, input: ExpressionInput, expressions: Expression[], entries: Entry[]) {
  switch (input.from) {
    case "expression":
      return runExpression(team, input.expressionName, expressions, entries);
    case "field":
      return entries.map((entry) => entry.values[input.fieldIndex]);
    default:
      return 0;
  }
}

export function runExpression(team: string, expressionName: string, expressions: Expression[], entries: Entry[]) {
  const expression = expressions.find((e) => e.name == expressionName);
  if (!expression) return 0;

  const values: any[] = expression.inputs.flatMap((input) => getExpressionInput(team, input, expressions, entries));

  switch (expression.type) {
    case "average":
      return values.reduce((prev, curr) => prev + curr, 0) / values.length;
    case "min":
      return Math.min(...values);
    case "max":
      return Math.max(...values);
    case "sum":
      return values.reduce((prev, curr) => prev + curr, 0) as number;
    case "count":
      return values.reduce((prev, curr) => {
        if (expression?.type != "count") return prev;
        if (curr != expression.valueToCount) return prev;
        return prev + 1;
      }, 0) as number;
    case "convert":
      return values.map((value) => {
        if (expression?.type != "convert") return value;
        for (const converter of expression.converters) {
          if (value == converter.from) {
            return converter.to;
          }
        }
        return expression.defaultTo === "" ? value : expression.defaultTo;
      });
    case "multiply":
      return values.map((value) => {
        if (expression?.type != "multiply") return value;
        return value * expression.multiplier;
      });
    case "divide":
      return values.map((value) => {
        if (expression?.type != "divide") return value;
        return value / expression.divisor;
      });
    case "abs":
      return values.map((value) => {
        if (expression?.type != "abs") return value;
        return Math.abs(value);
      });
    default:
      const unhandledType: never = expression;
      throw new Error(`Unhandled type for expression: ${(expression as Expression).type}`);
  }
}
