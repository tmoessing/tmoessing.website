/**
 * Assembles the whole game library page from its components. Rendered once,
 * synchronously, before LibraryPage.init() looks up its element ids.
 *
 *   SiteHeader      breadcrumb + theme toggle
 *   LibraryHero     title + welcome blurb
 *   LibraryToolbar  SearchBox · ViewToggle · SortSelect · PickButton
 *   GamesGrid       card grid + count  (cards: GameCard.js)
 *
 * The details and picker modals mount themselves on demand.
 */
import { SiteHeader } from "./SiteHeader.js";
import { LibraryHero } from "./LibraryHero.js";
import { LibraryToolbar } from "./LibraryToolbar.js";
import { GamesGrid } from "./GamesGrid.js";

export function LibraryShell() {
  return `
    <div class="library-page">
      ${SiteHeader({ crumbs: [{ label: "Personal", href: "../#/personal" }], current: "Games" })}
      ${LibraryHero({
        title: "Game Library",
        intro:
          "Welcome to game night! 🎲 Here's the whole collection. Grab some snacks, browse the shelf, or can't decide? Narrow things down with <strong>Filters</strong>, then hit <strong>Pick a Game</strong> and let fate choose tonight's winner from the list."
      })}
      ${LibraryToolbar()}
      ${GamesGrid()}
    </div>
  `;
}

export function mountLibraryShell(root) {
  root.innerHTML = LibraryShell();
}
