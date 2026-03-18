import { addMonths, format, isValid, parseISO, subDays } from "date-fns";

export function calculateAgreementEndDate(
  startDate: string,
  durationInMonths: number,
) {
  if (!startDate || !durationInMonths) return "";
  const parsed = parseISO(startDate);
  if (!isValid(parsed)) return "";
  return format(subDays(addMonths(parsed, durationInMonths), 1), "yyyy-MM-dd");
}

export function formatAgreementDate(value?: string | null) {
  if (!value) return "Not provided";
  const parsed = parseISO(value);
  if (!isValid(parsed)) return value;
  return format(parsed, "dd MMMM yyyy");
}
