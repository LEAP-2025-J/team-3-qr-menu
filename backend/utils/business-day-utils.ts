/**
 * Business day тооцоолох utility функцууд
 * Business day: 09:00-04:00 (маргааш) = 1 business day
 */

/**
 * Тухайн цагийг business day болгон хөрвүүлэх
 * @param date - Хөрвүүлэх огноо
 * @returns Business day огноо (09:00 цагтай)
 */
export function getBusinessDay(date: Date): Date {
  const utc8Date = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Ulaanbaatar" })
  );
  const currentHour = utc8Date.getHours();

  // Хэрэв 00:00-06:59 хооронд бол өмнөх өдөр
  if (currentHour >= 0 && currentHour < 7) {
    const previousDay = new Date(utc8Date);
    previousDay.setDate(previousDay.getDate() - 1);
    previousDay.setHours(7, 0, 0, 0);
    return previousDay;
  }

  // Хэрэв 07:00-23:59 хооронд бол өнөөдөр
  const businessDay = new Date(utc8Date);
  businessDay.setHours(7, 0, 0, 0);
  return businessDay;
}

/**
 * Тухайн цагийг business day string болгон хөрвүүлэх
 * @param date - Хөрвүүлэх огноо
 * @returns Business day string (YYYY-MM-DD)
 */
export function getBusinessDayString(date: Date): string {
  const businessDay = getBusinessDay(date);
  return businessDay.toISOString().split("T")[0];
}

/**
 * Тухайн цагийг business day range болгон хөрвүүлэх
 * @param date - Хөрвүүлэх огноо
 * @returns Business day range {start, end}
 */
export function getBusinessDayRange(date: Date): { start: Date; end: Date } {
  const businessDay = getBusinessDay(date);
  const start = new Date(businessDay);
  const end = new Date(businessDay);
  end.setDate(end.getDate() + 1);
  end.setHours(7, 0, 0, 0);

  return { start, end };
}

/**
 * Тухайн цагийг business day range string болгон хөрвүүлэх
 * @param date - Хөрвүүлэх огноо
 * @returns Business day range string {start, end}
 */
export function getBusinessDayRangeString(date: Date): {
  start: string;
  end: string;
} {
  const range = getBusinessDayRange(date);
  return {
    start: range.start.toISOString(),
    end: range.end.toISOString(),
  };
}

/**
 * Одоогийн business day-г авах
 * @returns Одоогийн business day
 */
export function getCurrentBusinessDay(): Date {
  return getBusinessDay(new Date());
}

/**
 * Одоогийн business day string-г авах
 * @returns Одоогийн business day string
 */
export function getCurrentBusinessDayString(): string {
  return getBusinessDayString(new Date());
}

/**
 * Одоогийн business day range-г авах
 * @returns Одоогийн business day range
 */
export function getCurrentBusinessDayRange(): { start: Date; end: Date } {
  return getBusinessDayRange(new Date());
}

/**
 * Одоогийн business day range string-г авах
 * @returns Одоогийн business day range string
 */
export function getCurrentBusinessDayRangeString(): {
  start: string;
  end: string;
} {
  return getBusinessDayRangeString(new Date());
}
