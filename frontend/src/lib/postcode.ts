/**
 * UK postcode format validation (regex-based).
 * Matches patterns like: A1 1AA, SW1A 1AA, M1 1AA, etc.
 */
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}[0-9][0-9A-Z]?\s*[0-9][A-Z]{2}$/i;

export function isValidUkPostcode(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed === '') return true;
  return UK_POSTCODE_REGEX.test(trimmed);
}
