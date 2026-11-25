/**
 * Page title + intro blurb. `intro` is trusted HTML (it may contain <strong>).
 */
import { esc } from "../filters.js";

export function LibraryHero({ title, intro }) {
  return `
    <div class="library-hero">
      <h1>${esc(title)}</h1>
      <p>${intro}</p>
    </div>
  `;
}
