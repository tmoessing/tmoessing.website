/**
 * Search input with an inline row of active tag chips and an autocomplete
 * dropdown. Behaviour lives in LibraryPage; the ids are its hooks.
 */
import { esc } from "../filters.js";
import { icon } from "../icons.js";

export const SEARCH_PLACEHOLDER = "Search games...";

export function SearchBox({ placeholder = SEARCH_PLACEHOLDER } = {}) {
  return `
    <div class="search-container">
      <div class="search-box" id="game-search-box-container">
        ${icon("search", "search-icon")}
        <div id="game-search-tags" class="search-tags"></div>
        <input type="text" id="game-search-input" class="search-input"
               placeholder="${esc(placeholder)}" aria-label="Search games, tags, or categories">
      </div>
      <div id="game-search-suggestions" class="search-suggestions" hidden></div>
    </div>
  `;
}
