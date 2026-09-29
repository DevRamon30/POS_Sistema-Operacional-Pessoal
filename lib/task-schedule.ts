export interface ParsedSchedule {
  date: string | null;
  startTime: string | null;
  endTime: string | null;
}

const MONTHS: Record<string, number> = {
  janeiro: 1, fevereiro: 2, marco: 3, abril: 4, maio: 5, junho: 6,
  julho: 7, agosto: 8, setembro: 9, outubro: 10, novembro: 11, dezembro: 12,
};

function toIsoDate(year: number, month: number, day: number): string | null {
  const candidate = new Date(year, month - 1, day);
  if (candidate.getFullYear() !== year || candidate.getMonth() !== month - 1 || candidate.getDate() !== day) return null;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatTime(hour: string, minute?: string): string | null {
  const h = Number(hour);
  const m = Number(minute ?? 0);
  if (h > 23 || m > 59) return null;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function parseScheduleFromText(text: string, now = new Date()): ParsedSchedule {
  const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  let date: string | null = null;
  const isoMatch = normalized.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  const numericMatch = normalized.match(/\b(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?\b/);
  const writtenMatch = normalized.match(/\b(\d{1,2})\s+de\s+([a-z]+)(?:\s+de\s+(\d{4}))?\b/);

  if (isoMatch) {
    date = toIsoDate(Number(isoMatch[1]), Number(isoMatch[2]), Number(isoMatch[3]));
  } else if (numericMatch) {
    const yearText = numericMatch[3];
    const year = yearText ? (yearText.length === 2 ? 2000 + Number(yearText) : Number(yearText)) : now.getFullYear();
    date = toIsoDate(year, Number(numericMatch[2]), Number(numericMatch[1]));
  } else if (writtenMatch && MONTHS[writtenMatch[2]]) {
    date = toIsoDate(Number(writtenMatch[3] ?? now.getFullYear()), MONTHS[writtenMatch[2]], Number(writtenMatch[1]));
  } else if (/\bamanha\b/.test(normalized)) {
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    date = toIsoDate(tomorrow.getFullYear(), tomorrow.getMonth() + 1, tomorrow.getDate());
  } else if (/\bhoje\b/.test(normalized)) {
    date = toIsoDate(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }

  const timeMatches = Array.from(normalized.matchAll(/\b(\d{1,2})(?::|h)(\d{2})?\b/g))
    .map((match) => formatTime(match[1], match[2]))
    .filter((time): time is string => Boolean(time));

  return { date, startTime: timeMatches[0] ?? null, endTime: timeMatches[1] ?? null };
}

export function parseLocalTaskDate(value: string): Date {
  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
  }
  return new Date(value);
}
