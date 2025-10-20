import { z } from "zod";

export const CompetitionValidator = z.object({
      title: z.string().trim().min(1, "Title is required"),
      fee: z.number().positive().finite().optional()
  });

export type Competition = z.infer<typeof CompetitionValidator>;
