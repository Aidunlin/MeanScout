import type { Entry } from "$lib";
import { getDetailedFieldName, type Field } from "./field";

export const reduceExpressionTypes = ["average", "min", "max", "sum", "count"] as const;
export type ReduceExpressionType = (typeof reduceExpressionTypes)[number];

export const mapExpressionTypes = ["convert", "multiply", "divide", "abs"] as const;
export type MapExpressionType = (typeof mapExpressionTypes)[number];

export const expressionTypes = [...reduceExpressionTypes, ...mapExpressionTypes] as const;
export type ExpressionType = (typeof expressionTypes)[number];

type BaseExpression<T extends ExpressionType> = {
  name: string;
  type: T;
  inputs: ExpressionInput[];
};

type AverageExpression = BaseExpression<"average">;
type MinExpression = BaseExpression<"min">;
type MaxExpression = BaseExpression<"max">;
type SumExpression = BaseExpression<"sum">;
type CountExpression = BaseExpression<"count"> & { valueToCount: any };

export type ReduceExpression = AverageExpression | MinExpression | MaxExpression | SumExpression | CountExpression;

type ConvertExpression = BaseExpression<"convert"> & { converters: { from: any; to: any }[]; defaultTo: any };
type MultiplyExpression = BaseExpression<"multiply"> & { multiplier: number };
type DivideExpression = BaseExpression<"divide"> & { divisor: number };
type AbsExpression = BaseExpression<"abs">;

export type MapExpression = ConvertExpression | MultiplyExpression | DivideExpression | AbsExpression;

export type Expression = ReduceExpression | MapExpression;

export const expressionInputTypes = ["field", "expression"] as const;
export type ExpressionInputType = (typeof expressionInputTypes)[number];

export type ExpressionInput = { from: "field"; fieldIndex: number } | { from: "expression"; expressionName: string };

export type Weight = {
  expressionName: string;
  percentage: number;
};

export type PickList = {
  name: string;
  weights: Weight[];
};

export function generateExpressionName(expressions: Expression[], fields: Field[], expression: Expression) {
  let name = `${expression.type.toUpperCase()} `;
  if (reduceExpressionTypes.includes(expression.type as ReduceExpressionType)) {
    name += "OF ";
  }
  if (expression.type == "count") {
    name += expression.valueToCount + " IN ";
  }
  name += "(";
  name += expression.inputs
    .map((input) => {
      if (input.from == "field") {
        return `field: ${getDetailedFieldName(fields, input.fieldIndex)}`;
      } else {
        let subExpression = expressions.find((e) => e.name == input.expressionName);
        return subExpression?.name;
      }
    })
    .filter((thing) => thing)
    .join(", ");
  name += ")";
  if (expression.type == "multiply") {
    name += ` BY ${expression.multiplier}`;
  } else if (expression.type == "divide") {
    name += ` BY ${expression.divisor}`;
  }
  return name;
}

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
