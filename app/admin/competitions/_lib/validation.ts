import { z } from "zod";

const blankStringToUndefinedNumber = z
  .string()
  .transform((s) => (s === "" ? undefined : Number(s)))
  .pipe(z.union([z.number(), z.undefined()]));

export const CompetitionValidator = z.object({
      title: z.string().trim().min(1, "Title is required"),
      number1: blankStringToUndefinedNumber.pipe(z.number().finite().positive().optional()),
      number2: blankStringToUndefinedNumber.pipe(z.number().finite().positive().optional())
  });
