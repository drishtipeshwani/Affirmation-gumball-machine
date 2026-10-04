import collection from "./affirmations.json";
import { GetRandomAffirmationResponse } from "@workspace/api-zod";

/** Both the preview API and Vercel function use this single collection. */
export function chooseAffirmation() {
  const parsed = GetRandomAffirmationResponse.array().min(1).safeParse(collection);
  if (!parsed.success || parsed.data.some((item) => !item.id.trim() || !item.text.trim())) {
    throw new Error("The affirmation collection must contain valid, non-empty entries.");
  }
  return parsed.data[Math.floor(Math.random() * parsed.data.length)]!;
}