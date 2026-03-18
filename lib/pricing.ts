export function getDefaultPriceInr() {
  const raw = Number(process.env.NEXT_PUBLIC_DEFAULT_PRICE_INR ?? 149);
  return Number.isFinite(raw) && raw > 0 ? raw : 149;
}

export function toPaise(amountInr: number) {
  return Math.round(amountInr * 100);
}
