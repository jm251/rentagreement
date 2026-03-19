function stripWrappingQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

export function sanitizeEnvValue(value: string | null | undefined) {
  if (typeof value !== "string") {
    return undefined;
  }

  const withoutActualNewlines = value.replace(/[\r\n]+$/g, "").trim();
  const withoutQuotes = stripWrappingQuotes(withoutActualNewlines).trim();
  const cleaned = withoutQuotes.replace(/(?:\\r\\n|\\n|\\r)+$/g, "").trim();

  return cleaned.length > 0 ? cleaned : undefined;
}

export function getEnv(name: string) {
  return sanitizeEnvValue(process.env[name]);
}

export function getEnvNumber(name: string) {
  const value = getEnv(name);
  if (!value) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function getEnvFlag(name: string, fallback = false) {
  const value = getEnv(name);
  if (!value) {
    return fallback;
  }

  return value.toLowerCase() === "true";
}
