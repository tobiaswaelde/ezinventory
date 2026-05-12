import djs from 'dayjs';
// plugins
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';
import objectSupport from 'dayjs/plugin/objectSupport';
// locales
import 'dayjs/locale/en';
import 'dayjs/locale/de';

const ALLOWED_LOCALES = ['en', 'de'];

djs.extend(utc);
djs.extend(timezone);
djs.extend(duration);
djs.extend(relativeTime);
djs.extend(objectSupport);

export const updateDayjsLocale = (lang: string) => {
  const key = lang.split('-')[0].toLowerCase();
  if (ALLOWED_LOCALES.includes(key)) {
    djs.locale(key);
  } else {
    djs.locale('en');
  }
};

export default djs;
