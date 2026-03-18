import { STATE_LAW_MAP } from "@/data/state-law-map";

type PrefixRule = {
  length: 2 | 3;
  prefix: number;
  code: keyof typeof STATE_LAW_MAP;
};

const prefixRules: PrefixRule[] = [
  { length: 3, prefix: 160, code: "CH" },
  { length: 3, prefix: 396, code: "DN" },
  { length: 3, prefix: 403, code: "GA" },
  { length: 3, prefix: 605, code: "PY" },
  { length: 3, prefix: 682, code: "LD" },
  { length: 3, prefix: 737, code: "SK" },
  { length: 3, prefix: 738, code: "SK" },
  { length: 3, prefix: 744, code: "AN" },
  { length: 3, prefix: 790, code: "AR" },
  { length: 3, prefix: 791, code: "AR" },
  { length: 3, prefix: 792, code: "AR" },
  { length: 3, prefix: 793, code: "ML" },
  { length: 3, prefix: 794, code: "ML" },
  { length: 3, prefix: 795, code: "MN" },
  { length: 3, prefix: 796, code: "MZ" },
  { length: 3, prefix: 797, code: "NL" },
  { length: 3, prefix: 798, code: "NL" },
  { length: 3, prefix: 799, code: "TR" },
];

const twoDigitRules: Array<{
  start: number;
  end: number;
  code: keyof typeof STATE_LAW_MAP;
}> = [
  { start: 11, end: 11, code: "DL" },
  { start: 12, end: 13, code: "HR" },
  { start: 14, end: 16, code: "PB" },
  { start: 17, end: 17, code: "HP" },
  { start: 18, end: 19, code: "JK" },
  { start: 20, end: 23, code: "UP" },
  { start: 24, end: 24, code: "UK" },
  { start: 25, end: 28, code: "UP" },
  { start: 30, end: 34, code: "RJ" },
  { start: 36, end: 39, code: "GJ" },
  { start: 40, end: 44, code: "MH" },
  { start: 45, end: 48, code: "MP" },
  { start: 49, end: 49, code: "CG" },
  { start: 50, end: 50, code: "TS" },
  { start: 51, end: 53, code: "AP" },
  { start: 56, end: 59, code: "KA" },
  { start: 60, end: 64, code: "TN" },
  { start: 67, end: 69, code: "KL" },
  { start: 70, end: 74, code: "WB" },
  { start: 75, end: 77, code: "OD" },
  { start: 78, end: 78, code: "AS" },
  { start: 80, end: 82, code: "BR" },
  { start: 83, end: 85, code: "JH" },
];

export function resolveStateCodeFromPincode(pincode: string) {
  const digits = pincode.replace(/\D/g, "");
  if (digits.length !== 6) return null;

  const threeDigit = Number(digits.slice(0, 3));
  const special = prefixRules.find((rule) => rule.prefix === threeDigit);
  if (special) return special.code;

  const twoDigit = Number(digits.slice(0, 2));
  const rangeMatch = twoDigitRules.find(
    (rule) => twoDigit >= rule.start && twoDigit <= rule.end,
  );

  return rangeMatch?.code ?? null;
}
