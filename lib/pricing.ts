import { getEnvNumber } from "@/lib/env";

export function getDefaultPriceInr() {
  const raw = getEnvNumber("NEXT_PUBLIC_DEFAULT_PRICE_INR") ?? 149;
  return Number.isFinite(raw) && raw > 0 ? raw : 149;
}

export function toPaise(amountInr: number) {
  return Math.round(amountInr * 100);
}
