import { isValidBlankableNumber, type ValidationResult } from "@/lib/validation/validation";
import type { CompetitionFormValues } from "./form";

export function validateCompetitionFrontend(competition: CompetitionFormValues): ValidationResult<CompetitionFormValues> {
  const errors: Record<string, string> = {};

  // title
  if (competition.title.trim().length === 0) {
    errors.title = "Title is required";
  }

  // number1 (optional finite number)
  if (!isValidBlankableNumber(competition.number1)) {
    errors.number1 = "Must be a number or empty.";
  }

  // number2 (optional finite number)
  if (!isValidBlankableNumber(competition.number2)) {
    errors.number2 = "Must be a number or empty.";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value: competition };
}
