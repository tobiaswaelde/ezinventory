import { Dayjs } from 'dayjs';
import djs from '~/util/dayjs';

export class FormatUtil {
  //#region date/time
  private static toDjsInstance(date: string | Dayjs): Dayjs {
    return typeof date === 'string' ? djs(date) : date;
  }

  public static timestamp(date: string | Dayjs): string {
    const d = this.toDjsInstance(date);
    return d.format('DD.MM.YYYY HH:mm:ss');
  }

  public static dateOrTime(date: string | Dayjs): string {
    const d = this.toDjsInstance(date);
    if (d.startOf('day').isSame(djs().startOf('day'))) {
      return d.format('HH:mm');
    } else {
      return d.format('DD. MMM YYYY');
    }
  }

  //#endregion

  //#region file size
  public static bytes(bytes: number, decimals: number = 2): string {
    const k = 1024;
    const sizes = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = bytes / Math.pow(k, i);

    return new Intl.NumberFormat(undefined, {
      style: 'unit',
      unit: sizes[i],
      unitDisplay: 'short',
      maximumFractionDigits: decimals,
    }).format(value);
  }
  //#endregion
}
