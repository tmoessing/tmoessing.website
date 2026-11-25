/**
 * Top bar shared by the library pages: a breadcrumb back to the main site
 * plus the light/dark theme toggle (wired up by initTheme in games-main.js).
 *
 * crumbs: [{ label, href }] links between "Tyler Moessing" and the current page.
 */
import { esc } from "../filters.js";
import { icon } from "../icons.js";

const SEP = '<span class="crumb-sep" aria-hidden="true">/</span>';

export function SiteHeader({ crumbs = [], current }) {
  const links = crumbs
    .map((c) => `${SEP}<a href="${esc(c.href)}" class="crumb-link">${esc(c.label)}</a>`)
    .join("");

  return `
    <header class="library-header">
      <nav class="site-crumbs" aria-label="Breadcrumb">
        <a href="../" class="crumb-home">
          <img src="../assets/logo.svg" alt="" class="crumb-logo" width="28" height="28">
          <span>Tyler Moessing</span>
        </a>
        ${links}
        ${SEP}
        <span class="crumb-current" aria-current="page">${esc(current)}</span>
      </nav>
      <button id="theme-toggle" class="theme-toggle-btn" aria-label="Toggle theme">
        ${icon("sun", "sun-icon")}
        ${icon("moon", "moon-icon", { hidden: true })}
      </button>
    </header>
  `;
}
