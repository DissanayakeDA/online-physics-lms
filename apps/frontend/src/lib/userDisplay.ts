/** First name for greetings: first word of full name (e.g. "Ada Lovelace" → "Ada"). */
export function firstNameFromFullName(fullName: string | undefined | null): string {
  if (!fullName?.trim()) return '';
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts[0] ?? fullName.trim();
}
