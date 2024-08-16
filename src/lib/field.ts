import { z } from "zod";

export const fieldTypes = ["toggle", "number", "select", "text", "rating", "timer", "group"] as const;
export type FieldType = (typeof fieldTypes)[number];

const toggleFieldSchema = z.object({
  name: z.string(),
  type: z.literal("toggle"),
});
export type ToggleField = z.infer<typeof toggleFieldSchema>;

const numberFieldSchema = z.object({
  name: z.string(),
  type: z.literal("number"),
  allowNegative: z.optional(z.boolean()),
});
export type NumberField = z.infer<typeof numberFieldSchema>;

const selectFieldSchema = z.object({
  name: z.string(),
  type: z.literal("select"),
  values: z.array(z.string()).nonempty(),
});
export type SelectField = z.infer<typeof selectFieldSchema>;

const textFieldSchema = z.object({
  name: z.string(),
  type: z.literal("text"),
  long: z.optional(z.boolean()),
  tip: z.optional(z.string()),
});
export type TextField = z.infer<typeof textFieldSchema>;

const ratingFieldSchema = z.object({
  name: z.string(),
  type: z.literal("rating"),
});
export type RatingField = z.infer<typeof ratingFieldSchema>;

const timerFieldSchema = z.object({
  name: z.string(),
  type: z.literal("timer"),
});
export type TimerField = z.infer<typeof timerFieldSchema>;

const singleFieldSchema = z.discriminatedUnion("type", [
  toggleFieldSchema,
  numberFieldSchema,
  selectFieldSchema,
  textFieldSchema,
  ratingFieldSchema,
  timerFieldSchema,
]);
type SingleField = z.infer<typeof singleFieldSchema>;

const groupFieldSchema = z.object({ name: z.string(), type: z.literal("group"), fields: z.array(singleFieldSchema) });

export const fieldSchema = z.discriminatedUnion("type", [...singleFieldSchema.options, groupFieldSchema]);
export type Field = z.infer<typeof fieldSchema>;

export function getDefaultFieldValue(field: SingleField) {
  switch (field.type) {
    case "toggle":
      return false;
    case "number":
      return 0;
    case "select":
      return field.values[0];
    case "text":
      return "";
    case "rating":
      return 0;
    case "timer":
      return 0;
    default:
      const unhandledType: never = field;
      throw new Error(`Unhandled type for field ${unhandledType}`);
  }
}

export function flattenFields(fields: Field[]) {
  return fields.flatMap((field) => (field.type == "group" ? field.fields : field));
}

export function getDetailedFieldName(fields: Field[], flattenedFieldIndex: number) {
  let flattenedFieldCount = 0;
  for (const field of fields) {
    if (field.type == "group") {
      for (const subField of field.fields) {
        if (flattenedFieldCount == flattenedFieldIndex) {
          return `${field.name} ${subField.name}`;
        }
        flattenedFieldCount++;
      }
    } else {
      if (flattenedFieldCount == flattenedFieldIndex) {
        return field.name;
      }
      flattenedFieldCount++;
    }
  }
  return "";
}

export function isValidField(field: any) {
  if (typeof field != "object") return false;
  if (typeof field.name != "string" || !field.name.trim()) return false;

  if (!fieldTypes.includes(field.type)) return false;
  if (field.type == "select" && !Array.isArray(field.values)) return false;
  if (field.type == "group" && !Array.isArray(field.fields)) return false;

  return true;
}
