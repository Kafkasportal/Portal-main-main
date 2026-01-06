
export function formatTurkishPhoneNumber(value: string): string {
  // Remove all non-numeric characters
  let cleaned = value.replace(/\D/g, '')

  // Remove leading 90 if present
  if (cleaned.startsWith('90')) {
    cleaned = cleaned.substring(2)
  }

  // Ensure it starts with 0 if there's any input, unless the user deleted everything
  if (cleaned.length > 0 && !cleaned.startsWith('0')) {
    cleaned = '0' + cleaned
  }

  // Limit to 11 digits (0 + 10 digits)
  if (cleaned.length > 11) {
    cleaned = cleaned.substring(0, 11)
  }

  // Apply formatting
  let formatted = cleaned
  if (cleaned.length > 4) {
    formatted = `${cleaned.slice(0, 4)} ${cleaned.slice(4)}`
  }
  if (cleaned.length > 7) {
    formatted = `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }
  if (cleaned.length > 9) {
    formatted = `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7, 9)} ${cleaned.slice(9)}`
  }

  return formatted
}
