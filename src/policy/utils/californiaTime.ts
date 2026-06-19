export const CALIFORNIA_TIME_ZONE = 'America/Los_Angeles';

type DateTimeParts = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

function californiaParts(reference: Date): DateTimeParts | null {
  if (typeof Intl === 'undefined' || typeof Intl.DateTimeFormat !== 'function') {
    return null;
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: CALIFORNIA_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });

  const parts = Object.fromEntries(
    formatter.formatToParts(reference).map(part => [part.type, part.value]),
  );

  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second),
  };
}

export function getCaliforniaNow(reference: Date = new Date()): Date {
  const parts = californiaParts(reference);
  if (!parts) return new Date(reference);

  return new Date(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour,
    parts.minute,
    parts.second,
  );
}

export function toCaliforniaISODate(reference: Date = new Date()): string {
  const parts = californiaParts(reference);
  if (!parts) {
    const fallback = new Date(reference);
    return [
      fallback.getFullYear(),
      String(fallback.getMonth() + 1).padStart(2, '0'),
      String(fallback.getDate()).padStart(2, '0'),
    ].join('-');
  }

  return [
    parts.year,
    String(parts.month).padStart(2, '0'),
    String(parts.day).padStart(2, '0'),
  ].join('-');
}

export function formatCaliforniaDateTime(reference: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: CALIFORNIA_TIME_ZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  }).format(reference);
}
