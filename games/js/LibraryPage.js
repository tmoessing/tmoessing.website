/**
 * The game library grid page: renders every game and wires the toolbar
 * (search with tag autocomplete, sort, large-card / small-card / list view) and the
 * Pick-a-Game button. Search, tags and sort are mirrored into the URL so a
 * filtered view can be shared.
 */
import { GAMES, CATEGORIES } from "../data/games.js";
import { createGameCard } from "./components/GameCard.js";
import { sortGames, esc } from "./filters.js";
import { openPicker } from "./components/PickerModal.js";
import { icon } from "./icons.js";
import { readUrlState, writeFilters } from "./urlState.js";
import { SEARCH_PLACEHOLDER } from "./components/SearchBox.js";
import { VIEW_OPTIONS } from "./components/ViewToggle.js";
import { PRESETS } from "./components/PresetFilters.js";

const VIEW_KEY = "library-view";
const VIEWS = VIEW_OPTIONS.map((o) => o.view);

function readStoredView() {
  try {
    const v = localStorage.getItem(VIEW_KEY);
    return VIEWS.includes(v) ? v : "grid";
  } catch (_) {
    return "grid";
  }
}

export class LibraryPage {
  constructor() {
    this.games = sortGames(GAMES, "alpha");
    this.searchQuery = "";
    this.activeTags = new Set();
    this.selectedSuggestionIndex = 0;
    this.view = readStoredView();
    this.favoritesOnly = false;
    this.activePresets = new Set();
  }

  init() {
    this.grid = document.getElementById("games-grid");
    this.countEl = document.getElementById("games-count");
    this.sortSel = document.getElementById("library-sort");
    this.viewBtns = Array.from(document.querySelectorAll(".view-btn[data-view]"));
    this.searchInput = document.getElementById("game-search-input");
    this.searchBox = document.getElementById("game-search-box-container");
    this.suggestionsDiv = document.getElementById("game-search-suggestions");
    this.activeTagsDiv = document.getElementById("game-search-tags");

    // Every category and tag is a possible autocomplete suggestion.
    const tagsSet = new Set();
    GAMES.forEach((g) => {
      (g.categories || []).forEach((c) => tagsSet.add(c));
      (g.tags || []).forEach((t) => tagsSet.add(t));
    });
    this.matchableTags = Array.from(tagsSet);

    this.viewBtns.forEach((b) => b.addEventListener("click", () => this.setView(b.dataset.view)));
    this.applyView();

    document.getElementById("pick-a-game-btn").addEventListener("click", () => openPicker());

    this.sortSel.addEventListener("change", () => this.updateList());

    this.presetBtns = Array.from(document.querySelectorAll(".preset-chip[data-preset]"));
    this.presetBtns.forEach((b) =>
      b.addEventListener("click", () => {
        const id = b.dataset.preset;
        this.activePresets.has(id) ? this.activePresets.delete(id) : this.activePresets.add(id);
        this.applyPresetButtons();
        this.updateList();
      })
    );

    this.favBtn = document.getElementById("favorites-toggle");
    this.favBtn.addEventListener("click", () => {
      this.favoritesOnly = !this.favoritesOnly;
      this.applyFavoritesButton();
      this.updateList();
    });

    this.searchBox.addEventListener("click", () => this.searchInput.focus());
    this.searchInput.addEventListener("input", () => {
      this.searchQuery = this.searchInput.value.toLowerCase().trim();
      this.selectedSuggestionIndex = 0;
      this.renderSuggestions();
      this.updateList();
    });
    this.searchInput.addEventListener("keydown", (e) => this.onSearchKeydown(e));

    document.addEventListener("click", (e) => {
      if (!e.target.closest(".search-container")) this.hideSuggestions();
    });

    this.applyUrlState();
    this.updateList();
  }

  /** Restore search text, tags and sort from a shared link. */
  applyUrlState() {
    const { q, tags, sort, fav, presets } = readUrlState();
    presets.forEach((id) => PRESETS.some((p) => p.id === id) && this.activePresets.add(id));
    this.applyPresetButtons();
    this.favoritesOnly = fav;
    this.applyFavoritesButton();
    if (q) {
      this.searchInput.value = q;
      this.searchQuery = q.toLowerCase().trim();
    }
    tags.forEach((t) => {
      const match = this.matchableTags.find((m) => m.toLowerCase() === t.toLowerCase());
      if (match) this.activeTags.add(match);
    });
    // Default to title A–Z unless a shared link says otherwise (also undoes
    // browsers restoring the last-used <select> value on reload).
    const validSort = sort && [...this.sortSel.options].some((o) => o.value === sort);
    this.sortSel.value = validSort ? sort : "alpha";
    this.renderActiveTags();
  }

  applyPresetButtons() {
    this.presetBtns.forEach((b) => {
      const on = this.activePresets.has(b.dataset.preset);
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", String(on));
    });
  }

  applyFavoritesButton() {
    this.favBtn.classList.toggle("active", this.favoritesOnly);
    this.favBtn.setAttribute("aria-pressed", String(this.favoritesOnly));
  }

  onSearchKeydown(e) {
    const matches = this.getMatchingTags();
    if (matches.length > 0 && !this.suggestionsDiv.hidden) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.selectedSuggestionIndex = (this.selectedSuggestionIndex + 1) % matches.length;
        this.highlightSuggestion();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.selectedSuggestionIndex =
          (this.selectedSuggestionIndex - 1 + matches.length) % matches.length;
        this.highlightSuggestion();
      } else if (e.key === "Tab" || e.key === "Enter") {
        e.preventDefault();
        this.addActiveTag(matches[this.selectedSuggestionIndex]);
      } else if (e.key === "Escape") {
        this.hideSuggestions();
      }
    } else if (e.key === "Backspace" && !this.searchInput.value && this.activeTags.size > 0) {
      const last = Array.from(this.activeTags).pop();
      this.removeActiveTag(last, false);
    }
  }

  getMatchingTags() {
    const val = this.searchInput.value.toLowerCase().trim();
    if (!val) return [];
    return this.matchableTags
      .filter((t) => t.toLowerCase().includes(val) && !this.activeTags.has(t))
      .slice(0, 5);
  }

  renderSuggestions() {
    const matches = this.getMatchingTags();
    if (matches.length === 0) {
      this.hideSuggestions();
      return;
    }

    this.suggestionsDiv.innerHTML = "";
    matches.forEach((tag, index) => {
      const item = document.createElement("div");
      item.className = "suggestion-item" + (index === this.selectedSuggestionIndex ? " active" : "");
      item.innerHTML = `
        <span>${esc(tag)}</span>
        <span class="suggestion-type">${CATEGORIES.includes(tag) ? "Category" : "Tag"}</span>
      `;
      item.addEventListener("click", (e) => {
        e.stopPropagation();
        this.addActiveTag(tag);
      });
      this.suggestionsDiv.appendChild(item);
    });
    this.suggestionsDiv.hidden = false;
  }

  highlightSuggestion() {
    this.suggestionsDiv.querySelectorAll(".suggestion-item").forEach((item, index) => {
      item.classList.toggle("active", index === this.selectedSuggestionIndex);
    });
  }

  hideSuggestions() {
    this.suggestionsDiv.hidden = true;
    this.selectedSuggestionIndex = 0;
  }

  addActiveTag(tag) {
    this.activeTags.add(tag);
    this.searchInput.value = "";
    this.searchQuery = "";
    this.renderActiveTags();
    this.hideSuggestions();
    this.updateList();
    this.searchInput.focus();
  }

  removeActiveTag(tag, refocus = true) {
    this.activeTags.delete(tag);
    this.renderActiveTags();
    this.updateList();
    if (refocus) this.searchInput.focus();
  }

  renderActiveTags() {
    this.activeTagsDiv.innerHTML = "";
    this.activeTags.forEach((tag) => {
      const pill = document.createElement("span");
      pill.className = "search-pill";
      pill.innerHTML = `
        <span>${esc(tag)}</span>
        <button type="button" class="remove-tag-btn" aria-label="Remove ${esc(tag)} filter">✕</button>
      `;
      pill.querySelector(".remove-tag-btn").addEventListener("click", (e) => {
        e.stopPropagation();
        this.removeActiveTag(tag);
      });
      this.activeTagsDiv.appendChild(pill);
    });
    this.searchInput.placeholder = this.activeTags.size > 0 ? "" : SEARCH_PLACEHOLDER;
  }

  getFilteredGames() {
    let filtered = GAMES;

    if (this.favoritesOnly) filtered = filtered.filter((g) => g.favorite);

    // Preset chips: a game must pass every active preset.
    const presets = PRESETS.filter((p) => this.activePresets.has(p.id));
    if (presets.length) filtered = filtered.filter((g) => presets.every((p) => p.match(g)));

    // Locked tags: a game must have every one (as a tag or a category).
    if (this.activeTags.size > 0) {
      const wanted = Array.from(this.activeTags, (t) => t.toLowerCase());
      filtered = filtered.filter((g) => {
        const have = [...(g.categories || []), ...(g.tags || [])].map((t) => t.toLowerCase());
        return wanted.every((t) => have.includes(t));
      });
    }

    // Free-text search over title, description, tags and categories.
    if (this.searchQuery) {
      const q = this.searchQuery;
      filtered = filtered.filter((g) =>
        [g.title, g.description || "", ...(g.tags || []), ...(g.categories || [])].some((s) =>
          s.toLowerCase().includes(q)
        )
      );
    }

    return filtered;
  }

  updateList() {
    this.games = sortGames(this.getFilteredGames(), this.sortSel.value);
    writeFilters({
      q: this.searchInput.value.trim(),
      tags: Array.from(this.activeTags),
      sort: this.sortSel.value,
      fav: this.favoritesOnly,
      presets: Array.from(this.activePresets)
    });
    this.render();
  }

  setView(view) {
    if (this.view === view || !VIEWS.includes(view)) return;
    this.view = view;
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch (_) {
      /* storage unavailable (private mode): view just won't persist */
    }
    this.applyView();
  }

  applyView() {
    this.grid.classList.toggle("compact-view", this.view === "compact");
    this.grid.classList.toggle("list-view", this.view === "list");
    this.viewBtns.forEach((b) => {
      const on = b.dataset.view === this.view;
      b.classList.toggle("active", on);
      b.setAttribute("aria-pressed", String(on));
    });
  }

  render() {
    this.grid.innerHTML = "";
    if (this.games.length === 0) {
      const empty = document.createElement("div");
      empty.className = "picker-empty library-empty";
      empty.innerHTML = `
        <div class="picker-empty-icon">${icon("alert", "icon-hero")}</div>
        <h3>${this.favoritesOnly ? "No favorites match your search" : "No games match your search"}</h3>
        <p>Try adjusting your query or keywords</p>
      `;
      this.grid.appendChild(empty);
    } else {
      const frag = document.createDocumentFragment();
      this.games.forEach((g) => frag.appendChild(createGameCard(g)));
      this.grid.appendChild(frag);
    }
    const n = this.games.length;
    this.countEl.textContent = `${n} game${n === 1 ? "" : "s"}`;
  }
}
