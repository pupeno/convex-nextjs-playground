import { z } from "zod";

const blankStringToNullNumber = z
  .string()
  .transform((s) => (s === "" ? null : Number(s)))
  .pipe(z.union([z.number(), z.null()]));

export const CompetitionValidator = z.object({
      title: z.string().trim().min(1, "Title is required"),
      number1: blankStringToNullNumber.pipe(z.union([z.number().finite().positive(), z.null()])).optional(),
      number2: blankStringToNullNumber.pipe(z.union([z.number().finite().positive(), z.null()])).optional()
  });
