import dayjs from 'dayjs';

export class DateUtil {
  public static getDaysBetween(startDate: string | Date, endDate: string | Date): Date[] {
    const days: Set<Date> = new Set();

    let current = dayjs(startDate);
    let last = dayjs(endDate);

    while (current.isSame(last, 'day') || current.isBefore(last, 'day')) {
      days.add(current.toDate());
      current = current.add(1, 'day');
    }

    return Array.from(days);
  }
}
