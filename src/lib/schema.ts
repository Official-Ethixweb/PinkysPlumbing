import { business } from '../data/business';

export interface BreadcrumbSegment {
  name: string;
  /** Path relative to the site root, e.g. "/services/" or "/services/water-heaters/". */
  path: string;
}

/** Builds a BreadcrumbList JSON-LD object from page-root-relative paths, so
 * every page's breadcrumb schema is generated the same way instead of
 * hand-built inline (previously copy-pasted with the same shape on every
 * page). */
export function buildBreadcrumbSchema(segments: BreadcrumbSegment[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: segments.map((segment, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: segment.name,
      item: `${business.url}${segment.path}`
    }))
  };
}
