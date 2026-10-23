// Fixed locale + time zone so server and client render the same text
const numberFormat = new Intl.NumberFormat('id-ID');
const compactFormat = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  maximumFractionDigits: 1
});
const shortDateFormat = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  timeZone: 'Asia/Jakarta'
});
const dateTimeFormat = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Jakarta'
});

export const formatNumber = (value: number) => numberFormat.format(value);
export const formatCompact = (value: number) => compactFormat.format(value);
export const formatShortDate = (iso: string) => shortDateFormat.format(new Date(iso));
export const formatDateTime = (iso: string) => dateTimeFormat.format(new Date(iso));
