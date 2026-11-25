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
  check: '<polyline points="20 6 9 17 4 12"/>',
  search:
    '<path d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"/>',
  sun:
    '<path d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"/>',
  moon:
    '<path d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"/>',
  grid:
    '<path d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"/>',
  compact:
    '<rect x="3.75" y="3.75" width="4.5" height="4.5" rx="1"/><rect x="9.75" y="3.75" width="4.5" height="4.5" rx="1"/><rect x="15.75" y="3.75" width="4.5" height="4.5" rx="1"/><rect x="3.75" y="9.75" width="4.5" height="4.5" rx="1"/><rect x="9.75" y="9.75" width="4.5" height="4.5" rx="1"/><rect x="15.75" y="9.75" width="4.5" height="4.5" rx="1"/><rect x="3.75" y="15.75" width="4.5" height="4.5" rx="1"/><rect x="9.75" y="15.75" width="4.5" height="4.5" rx="1"/><rect x="15.75" y="15.75" width="4.5" height="4.5" rx="1"/>',
  list: '<path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"/>'
};

export function icon(name, sizeClass = "", { hidden = false } = {}) {
  return `<svg class="icon icon-stroke gi ${sizeClass}" viewBox="0 0 24 24" aria-hidden="true"${hidden ? " hidden" : ""}>${PATHS[name]}</svg>`;
}
