/**
 * The row under the hero: search on the left, view / sort / Pick a Game on
 * the right.
 */
import { icon } from "../icons.js";
import { SearchBox } from "./SearchBox.js";
import { ViewToggle } from "./ViewToggle.js";
import { SortSelect } from "./SortSelect.js";

export function PickButton() {
  return `
    <button type="button" id="pick-a-game-btn" class="btn btn-primary btn-icon">
      ${icon("dice", "icon-md")}
      Pick a Game
    </button>
  `;
}

export function FavoritesToggle() {
  return `
    <button type="button" id="favorites-toggle" class="btn btn-secondary btn-icon favorites-toggle"
            aria-pressed="false" title="Show only personal favorites">
      ${icon("star", "icon-md")}
      Favorites
    </button>
  `;
}

export function LibraryToolbar() {
  return `
    <div class="library-toolbar">
      ${SearchBox()}
      <div class="toolbar-controls">
        ${FavoritesToggle()}
        ${ViewToggle()}
        ${SortSelect()}
        ${PickButton()}
      </div>
    </div>
  `;
}
