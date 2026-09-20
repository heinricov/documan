const DATE_FORMATTER = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "medium",
  timeStyle: "short",
})

export function formatDate(value: string): string {
  try {
    return DATE_FORMATTER.format(new Date(value))
  } catch {
    return value
  }
}
