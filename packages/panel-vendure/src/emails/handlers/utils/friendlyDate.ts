import dayjs from 'dayjs';
import 'dayjs/locale/es';
import utc from 'dayjs/plugin/utc';

dayjs.locale('es');
dayjs.extend(utc);

export const friendlyDate = (date: Date | undefined): string => {
  if (!date) {
    return '';
  }

  return dayjs(date).utcOffset(-180).format('DD MMMM YYYY');
};
