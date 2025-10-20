import { z } from "zod";

export const CompetitionValidator = z.object({
      title: z.string().trim().min(1, "Title is required"),
      fee: z.number().positive().finite().optional()
  });

export type Competition = z.infer<typeof CompetitionValidator>;

export type CompetitionForForm = {
  title: string,
  fee: string
}

export function toForm(competition: Competition): CompetitionForForm {
  return {...competition,
    fee: String(competition.fee)
  }
}

export function fromForm(competition: CompetitionForForm): Competition {
  return {...competition,
    fee: parseFloat(competition.fee) ?? undefined // Write proper logic to yield `undefined`
  }
}
