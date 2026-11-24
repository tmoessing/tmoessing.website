/**
 * Shared stroke icons for the game library, so each SVG lives in one place
 * instead of being pasted inline wherever it's used.
 *
 * icon("clock", "icon-md") -> <svg class="icon icon-stroke gi icon-md">…</svg>
 * Size classes (games.css): default 0.85rem, icon-md, icon-lg, icon-xl, icon-hero.
 * Icons inherit color from their parent via currentColor; stroke width
 * comes from the site-wide .icon-stroke rule.
 */
const PATHS = {
  users:
    '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
  dice:
    '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><path d="M12 12h.01M16 8h.01M8 16h.01M8 8h.01M16 16h.01"/>',
  shuffle: '<path d="M16 3h5v5M4 20L21 3M21 16v5h-5M15 15l6 6M4 4l5 5"/>',
  refresh: '<path d="M21 2v6h-6"/><path d="M21 13a9 9 0 1 1-3-7.7L21 8"/>',
  info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
  alert: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
  globe:
    '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  share:
    '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>',
  check: '<polyline points="20 6 9 17 4 12"/>'
};

export function icon(name, sizeClass = "") {
  return `<svg class="icon icon-stroke gi ${sizeClass}" viewBox="0 0 24 24" aria-hidden="true">${PATHS[name]}</svg>`;
}
