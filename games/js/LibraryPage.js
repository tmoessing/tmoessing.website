/**
 * The game library grid page: renders every game and wires the toolbar
 * (search with tag autocomplete, sort, shuffle, grid/list view) and the
 * Pick-a-Game button. Search, tags and sort are mirrored into the URL so a
 * filtered view can be shared.
 */
import { GAMES, CATEGORIES } from "../data/games.js";
import { createGameCard } from "./GameCard.js";
import { sortGames, shuffle, esc } from "./filters.js";
import { openPicker } from "./PickerModal.js";
import { icon } from "./icons.js";
import { readUrlState, writeFilters } from "./urlState.js";

const VIEW_KEY = "library-view";
const SEARCH_PLACEHOLDER = "Search games...";

function readStoredView() {
  try {
    return localStorage.getItem(VIEW_KEY) === "list" ? "list" : "grid";
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
    // When set, a shuffled order (game id -> rank) that survives filtering
    // until the user picks a sort option again.
    this.shuffleRank = null;
    this.view = readStoredView();
  }

  init() {
    this.grid = document.getElementById("games-grid");
    this.countEl = document.getElementById("games-count");
    this.sortSel = document.getElementById("library-sort");
    this.gridBtn = document.getElementById("view-grid");
    this.listBtn = document.getElementById("view-list");
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

    this.gridBtn.addEventListener("click", () => this.setView("grid"));
    this.listBtn.addEventListener("click", () => this.setView("list"));
    this.applyView();

    document.getElementById("pick-a-game-btn").addEventListener("click", () => openPicker());

    document.getElementById("library-shuffle").addEventListener("click", () => {
      this.shuffleRank = new Map(shuffle(GAMES).map((g, i) => [g.id, i]));
      this.updateList();
    });

    this.sortSel.addEventListener("change", () => {
      this.shuffleRank = null;
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
    const { q, tags, sort } = readUrlState();
    if (q) {
      this.searchInput.value = q;
      this.searchQuery = q.toLowerCase().trim();
    }
    tags.forEach((t) => {
      const match = this.matchableTags.find((m) => m.toLowerCase() === t.toLowerCase());
      if (match) this.activeTags.add(match);
    });
    if (sort && [...this.sortSel.options].some((o) => o.value === sort)) {
      this.sortSel.value = sort;
    }
    this.renderActiveTags();
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
    const filtered = this.getFilteredGames();
    if (this.shuffleRank) {
      const rank = this.shuffleRank;
      this.games = [...filtered].sort((a, b) => rank.get(a.id) - rank.get(b.id));
    } else {
      this.games = sortGames(filtered, this.sortSel.value);
    }
    writeFilters({
      q: this.searchInput.value.trim(),
      tags: Array.from(this.activeTags),
      sort: this.sortSel.value
    });
    this.render();
  }

  setView(view) {
    if (this.view === view) return;
    this.view = view;
    try {
      localStorage.setItem(VIEW_KEY, view);
    } catch (_) {
      /* storage unavailable (private mode): view just won't persist */
    }
    this.applyView();
  }

  applyView() {
    const isList = this.view === "list";
    this.grid.classList.toggle("list-view", isList);
    this.gridBtn.classList.toggle("active", !isList);
    this.gridBtn.setAttribute("aria-pressed", String(!isList));
    this.listBtn.classList.toggle("active", isList);
    this.listBtn.setAttribute("aria-pressed", String(isList));
  }

  render() {
    this.grid.innerHTML = "";
    if (this.games.length === 0) {
      const empty = document.createElement("div");
      empty.className = "picker-empty library-empty";
      empty.innerHTML = `
        <div class="picker-empty-icon">${icon("alert", "icon-hero")}</div>
        <h3>No games match your search</h3>
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
