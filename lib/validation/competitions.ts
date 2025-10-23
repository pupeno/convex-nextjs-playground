import { z } from "zod/v3";

export const CompetitionValidator = z.object({
      title: z.string().trim().min(1, "Title is required"),
      number1: z.number().positive().finite().nullable().optional(),
      number2: z.number().positive().finite().nullable().optional()
  });

export type Competition = z.infer<typeof CompetitionValidator>;
