import KoreanLunarCalendar from 'korean-lunar-calendar';

export function currentKoreanYear() {
  return Number(
    new Intl.DateTimeFormat('en', {
      year: 'numeric',
      timeZone: 'Asia/Seoul',
    }).format(new Date()),
  );
}

export function birthInputRanges(
  calendar: string,
  year: number,
  month: number,
  isLeapMonth = false,
  currentYear = currentKoreanYear(),
) {
  let lastDay = calendar === 'lunar' ? 30 : 31;
  if (
    Number.isInteger(year) &&
    year >= 1899 &&
    year <= currentYear &&
    Number.isInteger(month) &&
    month >= 1 &&
    month <= 12
  ) {
    if (calendar === 'lunar') {
      const korean = new KoreanLunarCalendar();
      if (korean.setLunarDate(year, month, 29, isLeapMonth))
        lastDay = korean.setLunarDate(year, month, 30, isLeapMonth) ? 30 : 29;
    } else lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  }
  return {
    year: [calendar === 'lunar' ? 1899 : 1900, currentYear],
    month: [1, 12],
    day: [1, lastDay],
    hour: [0, 23],
    minute: [0, 59],
  } as const;
}
