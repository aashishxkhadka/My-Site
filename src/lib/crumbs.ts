import type { Crumb } from './schema';

/** Prepend Home to a page's breadcrumb trail. */
export const withHome = (crumbs?: Crumb[]): Crumb[] | undefined => (crumbs ? [{ label: 'Home', href: '/' }, ...crumbs] : undefined);
