const dateFmt = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });

export const formatDate = (d: Date) => dateFmt.format(d);
export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Build the full <title>, keeping the site suffix only when it fits in 60 chars. */
export function fullTitle(page: string, suffix: string, max = 60): string {
  const withSuffix = `${page}${suffix}`;
  return withSuffix.length <= max ? withSuffix : page;
}
