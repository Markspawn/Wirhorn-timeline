
export type ParsedFantasyDate = {
  displayDate: string;
  start: number;
  end?: number;
};

export const parseFantasyYear = (dateText: string): number => {
  const match = dateText.trim().match(/^(\d+)\s*(bs|ps)\b/i);

  if (!match) {
    throw new Error(`Could not parse fantasy date: ${dateText}`);
  }

  const year = Number.parseInt(match[1], 10);
  const era = match[2].toLowerCase();

  return era === 'bs' ? -year : year;
};

export const parseFantasyDate = (displayDate: string): ParsedFantasyDate => {
  const [rawStart, rawEnd] = displayDate.split('-').map((part) => part.trim());
  const start = parseFantasyYear(rawStart);

  if (!rawEnd) {
    return { displayDate, start };
  }

  return {
    displayDate,
    start,
    end: parseFantasyYear(rawEnd)
  };
};

export const timelineYearToValue = (year: number): number => {
  const date = new Date(0);
  date.setUTCFullYear(year, 0, 1);
  date.setUTCHours(0, 0, 0, 0);
  return date.getTime();
};

export const valueToTimelineYear = (value: number): number => new Date(value).getUTCFullYear();

export const formatTimelineYear = (value: number): string => {
  const year = valueToTimelineYear(value);

  if (year < 0) {
    return `${Math.abs(year)} BS`;
  }

  return `${year} PS`;
};

export const getEraForYear = (year: number): 'Before Shattering' | 'Post Shattering' =>
  year < 0 ? 'Before Shattering' : 'Post Shattering';
