/**
 * Library modals that share one overlay:
 *
 *   openFilters(initial, base, onApply)
 *     A 3-step wizard (players -> duration -> categories / complexity) with a
 *     live count over `base` (the library after search / presets). "Show N
 *     games" hands the filter state back so the library list narrows to it.
 *
 *   openPick(games)
 *     Picks a random game from `games` (whatever the library list currently
 *     shows), revealed via a shuffle-reel + confetti, with the other options
 *     listed below and a Pick Again button.
 *
 * Respects prefers-reduced-motion (skips reel + confetti).
 */
import { CATEGORIES, CORE_CATEGORIES } from "../../data/games.js";
import { matchGame, sortGames, tagPill, placeholderDataURI, esc } from "../filters.js";
import { icon } from "../icons.js";
import { createGameCard } from "./GameCard.js";
import { lockScroll, unlockScroll, openGameDetails } from "./GameDetailsModal.js";

const PLAYER_NUMBERS = [
  ["any", "Any"],
  ["1", "1"],
  ["2", "2"],
  ["3", "3"],
  ["4", "4"],
  ["5", "5"],
  ["6", "6"],
  ["7", "7"],
  ["8", "8"],
  ["9", "9"],
  ["10", "10"],
  ["other", "Other"]
];
const DURATIONS = [
  ["any", "Any"],
  ["u30", "Under 30"],
  ["30-60", "30–60"],
  ["60-90", "60–90"],
  ["30-90", "30–90"],
  ["90+", "90+"],
  ["custom", "Custom"]
];

const COMPLEXITIES = [
  ["any", "Any"],
  ["easy", "Easy"],
  ["medium", "Medium"],
  ["heavy", "Involved"]
];

const CONFETTI_COLORS = [
  "var(--tag-1-text)", "var(--tag-2-text)", "var(--tag-3-text)", "var(--tag-4-text)",
  "var(--tag-5-text)", "var(--tag-6-text)", "var(--tag-7-text)", "var(--tag-8-text)"
];

let overlay = null;
let state = null;
let returnFocusTo = null;
let baseGames = [];      // filters mode: games the live count runs over
let applyFilters = null; // filters mode: callback with the chosen state
let pool = [];           // pick mode: games to pick from

export function defaultState() {
  return {
    step: 1,
    playerMode: "any",
    playerCount: 4,
    playerMin: 4,
    playerMax: 4,
    playerRangePending: false,
    duration: "any",
    customLo: 30,
    customHi: 90,
    categories: new Set(),
    categoriesExpanded: false,
    complexity: "any"
  };
}

/** Deep-ish copy so the modal can edit freely until the user applies. */
function cloneState(s) {
  return { ...s, categories: new Set(s.categories), step: 1, playerRangePending: false };
}

/** How many of the four filter groups are narrowing the list (for badges). */
export function activeFilterCount(s) {
  if (!s) return 0;
  return (
    (s.playerMode !== "any" ? 1 : 0) +
    (s.duration !== "any" ? 1 : 0) +
    (s.categories.size > 0 ? 1 : 0) +
    (s.complexity !== "any" ? 1 : 0)
  );
}

const reduceMotion = () =>
  window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function content() {
  return overlay.querySelector(".picker-content");
}

function currentMatches() {
  return baseGames.filter((g) => matchGame(g, state));
}

/* ---------- open / close ---------- */

export function openFilters(initial, base, onApply) {
  if (overlay) return;
  state = cloneState(initial || defaultState());
  baseGames = base;
  applyFilters = onApply;
  mountOverlay();
  renderFilters();
  overlay.querySelector(".game-modal-close").focus();
}

export function openPick(games) {
  if (overlay) return;
  pool = games;
  mountOverlay();
  overlay.querySelector(".game-modal-close").focus();
  pickRandom();
}

function mountOverlay() {
  returnFocusTo = document.activeElement;

  overlay = document.createElement("div");
  overlay.className = "game-modal-overlay picker-overlay";
  overlay.innerHTML = `
    <div class="game-modal picker-modal" role="dialog" aria-modal="true">
      <button class="game-modal-close" type="button" aria-label="Close">✕</button>
      <div class="picker-content"></div>
    </div>`;
  document.body.appendChild(overlay);
  lockScroll();

  requestAnimationFrame(() => overlay.classList.add("open"));
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closePicker();
  });
  overlay.querySelector(".game-modal-close").addEventListener("click", closePicker);
  document.addEventListener("keydown", onEsc);
}

function onEsc(e) {
  // Let a stacked details modal handle Escape first.
  if (e.key === "Escape" && !window.__gameDetailsOpen) closePicker();
}

export function closePicker() {
  if (!overlay) return;
  overlay.remove();
  overlay = null;
  unlockScroll();
  document.removeEventListener("keydown", onEsc);
  document.querySelectorAll(".confetti-piece").forEach((c) => c.remove());
  if (returnFocusTo && document.contains(returnFocusTo)) returnFocusTo.focus();
  returnFocusTo = null;
}

/* ---------- helpers ---------- */

function pillRow(items, activeValue, extraClass = "") {
  return items
    .map(
      ([val, label]) =>
        `<button type="button" class="picker-pill ${extraClass}${val === activeValue ? " active" : ""}" data-val="${esc(val)}">${esc(label)}</button>`
    )
    .join("");
}

function updateCount() {
  const n = currentMatches().length;
  const countEl = overlay.querySelector("#picker-count");
  if (countEl) countEl.textContent = `${n} game${n === 1 ? "" : "s"} match`;
  const applyBtn = overlay.querySelector("#picker-apply-btn");
  if (applyBtn) {
    applyBtn.textContent = `Show ${n} Game${n === 1 ? "" : "s"}`;
    applyBtn.disabled = n === 0;
  }
}

const DEFAULT_SUB = "Narrow the library down to games that fit your group.";

function pickerHeading(sub) {
  return `
      <h2 class="picker-title">${icon("filter", "icon-xl")} Filters</h2>
      <p class="picker-sub">${esc(sub)}</p>`;
}

/* ---------- view: filters ---------- */

function renderFilters() {
  const showCustom = state.duration === "custom";

  const isPillActive = (val) => {
    if (val === "any") return state.playerMode === "any";
    if (val === "other") return state.playerMode === "exact" && (state.playerCount < 1 || state.playerCount > 10);

    const num = parseInt(val, 10);
    if (state.playerMode === "exact") return state.playerCount === num;
    if (state.playerMode === "range") return num >= state.playerMin && num <= state.playerMax;
    return false;
  };

  const showCustomInput = state.playerMode === "exact" && (state.playerCount < 1 || state.playerCount > 10);

  const subText = state.playerRangePending
    ? "Click a second number to define a range of players."
    : "Narrow the library down to games that fit your group (click two numbers to select a range).";

  const headerHtml = `
    <div class="picker-steps-header">
      <div class="step-indicator ${state.step === 1 ? "active" : "completed"}">
        <span class="step-num">1</span>
        <span class="step-text">Players</span>
      </div>
      <div class="step-line ${state.step > 1 ? "completed" : ""}"></div>
      <div class="step-indicator ${state.step === 2 ? "active" : state.step > 2 ? "completed" : ""}">
        <span class="step-num">2</span>
        <span class="step-text">Duration</span>
      </div>
      <div class="step-line ${state.step > 2 ? "completed" : ""}"></div>
      <div class="step-indicator ${state.step === 3 ? "active" : ""}">
        <span class="step-num">3</span>
        <span class="step-text">Categories</span>
      </div>
    </div>
  `;

  if (state.step === 1) {
    content().innerHTML = `
      ${pickerHeading(subText)}

      ${headerHtml}

      <div class="picker-step-card">
        <div class="picker-section">
          <div class="picker-section-title">Players</div>
          <div class="pill-row" id="picker-players">
            ${PLAYER_NUMBERS.map(([val, label]) => 
              `<button type="button" class="picker-pill ${isPillActive(val) ? "active" : ""}" data-val="${esc(val)}">${esc(label)}</button>`
            ).join("")}
          </div>
          <div class="picker-inline" id="picker-count-wrap"${showCustomInput ? "" : " hidden"}>
            <label>Enter player count:
              <div class="picker-number-stepper">
                <button type="button" class="picker-pill stepper-btn" id="picker-stepper-minus">−</button>
                <input type="number" min="1" max="100" class="picker-number picker-number-compact" id="picker-player-count" value="${esc(state.playerCount)}">
                <button type="button" class="picker-pill stepper-btn" id="picker-stepper-plus">+</button>
              </div>
            </label>
          </div>
        </div>
      </div>

      <div class="picker-footer">
        <button type="button" class="btn btn-outline" id="picker-clear-btn">Clear</button>
        <span class="picker-count" id="picker-count"></span>
        <button type="button" class="btn btn-secondary" id="picker-apply-btn">Show Games</button>
        <button type="button" class="btn btn-primary" id="picker-next-btn">Next: Duration</button>
      </div>
    `;
  } else if (state.step === 2) {
    content().innerHTML = `
      ${pickerHeading(DEFAULT_SUB)}

      ${headerHtml}

      <div class="picker-step-card">
        <div class="picker-section">
          <div class="picker-section-title">Duration</div>
          <div class="pill-row" id="picker-duration">${pillRow(DURATIONS, state.duration)}</div>
          <div class="picker-inline picker-custom" id="picker-custom-wrap"${showCustom ? "" : " hidden"}>
            <label>From <input type="number" min="0" class="picker-number" id="picker-custom-lo" value="${esc(state.customLo)}"></label>
            <label>to <input type="number" min="0" class="picker-number" id="picker-custom-hi" value="${esc(state.customHi)}"></label>
            <span class="picker-unit">min</span>
          </div>
        </div>
      </div>

      <div class="picker-footer">
        <button type="button" class="btn btn-outline" id="picker-prev-btn">← Back</button>
        <span class="picker-count" id="picker-count"></span>
        <button type="button" class="btn btn-secondary" id="picker-apply-btn">Show Games</button>
        <button type="button" class="btn btn-primary" id="picker-next-btn">Next: Categories</button>
      </div>
    `;
  } else {
    const visibleCategories = state.categoriesExpanded ? CATEGORIES : CORE_CATEGORIES;

    content().innerHTML = `
      ${pickerHeading(DEFAULT_SUB)}

      ${headerHtml}

      <div class="picker-step-card">
        <div class="picker-section">
          <div class="picker-section-title">Categories</div>
          <div class="pill-row" id="picker-categories">
            ${visibleCategories.map(
              (c) =>
                `<button type="button" class="picker-pill${state.categories.has(c) ? " active" : ""}" data-cat="${esc(c)}">${esc(c)}</button>`
            ).join("")}
            <button type="button" class="picker-pill picker-expand-btn" id="picker-toggle-categories">
              ${state.categoriesExpanded ? "– Show Less" : "+ Show More"}
            </button>
          </div>
        </div>
        <div class="picker-section picker-section-spaced">
          <div class="picker-section-title">Complexity</div>
          <div class="pill-row" id="picker-complexity">${pillRow(COMPLEXITIES, state.complexity)}</div>
        </div>
      </div>

      <div class="picker-footer">
        <button type="button" class="btn btn-outline" id="picker-prev-btn">← Back</button>
        <button type="button" class="btn btn-outline" id="picker-clear-btn">Clear</button>
        <span class="picker-count" id="picker-count"></span>
        <button type="button" class="btn btn-primary" id="picker-apply-btn">Show Games</button>
      </div>
    `;
  }

  wireFilters();
  updateCount();
}

function activate(container, val) {
  container.querySelectorAll(".picker-pill").forEach((b) =>
    b.classList.toggle("active", b.dataset.val === val)
  );
}

function wireFilters() {
  content().querySelector("#picker-apply-btn").addEventListener("click", () => {
    const chosen = state;
    const cb = applyFilters;
    closePicker();
    cb && cb(chosen);
  });
  const clearBtn = content().querySelector("#picker-clear-btn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      state = defaultState();
      renderFilters();
    });
  }

  if (state.step === 1) {
    const players = content().querySelector("#picker-players");
    players.addEventListener("click", (e) => {
      const btn = e.target.closest(".picker-pill");
      if (!btn) return;
      const val = btn.dataset.val;

      if (val === "any") {
        state.playerMode = "any";
        state.playerRangePending = false;
        renderFilters();
      } else if (val === "other") {
        state.playerMode = "exact";
        state.playerRangePending = false;
        if (state.playerCount >= 1 && state.playerCount <= 10) {
          state.playerCount = 12;
        }
        renderFilters();
      } else {
        const num = parseInt(val, 10);
        if (!state.playerRangePending) {
          state.playerMode = "range";
          state.playerMin = num;
          state.playerMax = num;
          state.playerCount = num;
          state.playerRangePending = true;
        } else {
          if (num < state.playerMin) {
            state.playerMax = state.playerMin;
            state.playerMin = num;
          } else {
            state.playerMax = num;
          }
          state.playerRangePending = false;
        }
        renderFilters();
      }
      updateCount();
    });

    const inputEl = content().querySelector("#picker-player-count");
    if (inputEl) {
      content().querySelector("#picker-stepper-minus").addEventListener("click", () => {
        let val = parseInt(inputEl.value, 10) || 1;
        if (val > 1) {
          val -= 1;
          inputEl.value = val;
          state.playerCount = val;
          updateCount();
        }
      });

      content().querySelector("#picker-stepper-plus").addEventListener("click", () => {
        let val = parseInt(inputEl.value, 10) || 1;
        val += 1;
        inputEl.value = val;
        state.playerCount = val;
        updateCount();
      });

      inputEl.addEventListener("input", (e) => {
        state.playerCount = parseInt(e.target.value, 10) || 0;
        updateCount();
      });
    }

    content().querySelector("#picker-next-btn").addEventListener("click", () => {
      state.playerRangePending = false;
      state.step = 2;
      renderFilters();
    });
  } else if (state.step === 2) {
    const duration = content().querySelector("#picker-duration");
    duration.addEventListener("click", (e) => {
      const btn = e.target.closest(".picker-pill");
      if (!btn) return;
      state.duration = btn.dataset.val;
      activate(duration, state.duration);
      content().querySelector("#picker-custom-wrap").hidden = state.duration !== "custom";
      updateCount();
    });
    content().querySelector("#picker-custom-lo").addEventListener("input", (e) => {
      state.customLo = parseInt(e.target.value, 10) || 0;
      updateCount();
    });
    content().querySelector("#picker-custom-hi").addEventListener("input", (e) => {
      state.customHi = parseInt(e.target.value, 10) || 0;
      updateCount();
    });
    content().querySelector("#picker-prev-btn").addEventListener("click", () => {
      state.step = 1;
      renderFilters();
    });
    content().querySelector("#picker-next-btn").addEventListener("click", () => {
      state.step = 3;
      renderFilters();
    });
  } else if (state.step === 3) {
    const cats = content().querySelector("#picker-categories");
    cats.addEventListener("click", (e) => {
      const btn = e.target.closest(".picker-pill");
      if (!btn || btn.id === "picker-toggle-categories") return;
      const c = btn.dataset.cat;
      if (state.categories.has(c)) state.categories.delete(c);
      else state.categories.add(c);
      btn.classList.toggle("active");
      updateCount();
    });
    const cx = content().querySelector("#picker-complexity");
    cx.addEventListener("click", (e) => {
      const btn = e.target.closest(".picker-pill");
      if (!btn) return;
      state.complexity = btn.dataset.val;
      activate(cx, state.complexity);
      updateCount();
    });
    content().querySelector("#picker-toggle-categories").addEventListener("click", () => {
      state.categoriesExpanded = !state.categoriesExpanded;
      renderFilters();
    });
    content().querySelector("#picker-prev-btn").addEventListener("click", () => {
      state.step = 2;
      renderFilters();
    });
  }
}

/* ---------- view: random pick (reel + reveal) ---------- */

function pickRandom() {
  const matches = pool;
  if (matches.length === 0) {
    renderEmpty();
    return;
  }
  const chosen = matches[Math.floor(Math.random() * matches.length)];
  if (matches.length === 1 || reduceMotion()) {
    renderResult(chosen, matches);
    return;
  }
  runReel(matches, chosen);
}

function runReel(matches, chosen) {
  content().innerHTML = `
    <div class="picker-reel-wrap">
      <div class="picker-reel">
        <img class="reel-cover" alt="">
        <div class="reel-title"></div>
      </div>
      <p class="reel-caption">Rolling the dice…</p>
    </div>`;

  const reel = content().querySelector(".picker-reel");
  const img = reel.querySelector(".reel-cover");
  const title = reel.querySelector(".reel-title");

  let delay = 60;
  let elapsed = 0;
  const total = 1600;

  const tick = () => {
    if (!overlay) return; // closed mid-animation
    const g = matches[Math.floor(Math.random() * matches.length)];
    img.src = g.cover || placeholderDataURI(g.title);
    title.textContent = g.title;
    reel.classList.remove("cycle");
    void reel.offsetWidth; // restart animation
    reel.classList.add("cycle");

    elapsed += delay;
    delay *= 1.18;
    if (elapsed < total) {
      setTimeout(tick, delay);
    } else {
      renderResult(chosen, matches);
    }
  };
  tick();
}

function renderResult(game, matches) {
  const singleMatch = matches.length === 1;
  const others = sortGames(matches.filter((g) => g.id !== game.id), "alpha");
  const cover = game.cover || placeholderDataURI(game.title);
  const fallback = placeholderDataURI(game.title);
  const tags = (game.tags || []).map(tagPill).join("");

  content().innerHTML = `
    <div class="picker-result">
      ${singleMatch ? `<p class="picker-note">Only one game in your list. It was meant to be.</p>` : ""}
      <img class="picker-result-cover" src="${esc(cover)}" alt="${esc(game.title)} cover"
           onerror="this.onerror=null;this.src='${esc(fallback)}';">
      <h2 class="picker-result-title">${esc(game.title)}</h2>
      <p class="picker-result-desc">${esc(game.description || "")}</p>
      <div class="card-tags picker-result-tags">${tags}</div>
      <div class="picker-result-actions">
        <button type="button" class="btn btn-primary btn-icon" id="picker-play-now">
          ${icon("info", "icon-md")}
          View Details
        </button>
        <button type="button" class="btn btn-secondary btn-icon" id="picker-again">
          ${icon("refresh", "icon-md")}
          Pick Again
        </button>
        <button type="button" class="btn btn-outline" id="picker-close">Close</button>
      </div>
    </div>
    ${others.length ? `
    <section class="picker-others" aria-label="Other matching games">
      <h3 class="picker-others-title">Other options <span class="picker-others-count">${others.length}</span></h3>
      <div class="games-grid picker-grid" id="picker-others-grid"></div>
    </section>` : ""}`;

  const othersGrid = content().querySelector("#picker-others-grid");
  if (othersGrid) {
    const frag = document.createDocumentFragment();
    others.forEach((g) => frag.appendChild(createGameCard(g)));
    othersGrid.appendChild(frag);
  }

  content().querySelector("#picker-play-now").addEventListener("click", () => openGameDetails(game));
  content().querySelector("#picker-again").addEventListener("click", pickRandom);
  content().querySelector("#picker-close").addEventListener("click", closePicker);

  if (!reduceMotion()) spawnConfetti();
}

function spawnConfetti() {
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 40; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    const dur = 1.8 + Math.random() * 1.4;
    piece.style.animationDuration = dur + "s";
    piece.style.animationDelay = Math.random() * 0.4 + "s";
    piece.style.transform = `rotate(${Math.random() * 360}deg)`;
    piece.addEventListener("animationend", () => piece.remove());
    frag.appendChild(piece);
  }
  // Fixed-position, on <body>: full-screen effect with no modal scroll expansion.
  document.body.appendChild(frag);
}

/* ---------- view: empty state ---------- */

function renderEmpty() {
  content().innerHTML = `
    <div class="picker-empty">
      <div class="picker-empty-icon">
        ${icon("alert", "icon-hero")}
      </div>
      <h3>Nothing to pick from</h3>
      <p>Your current search and filters hide every game. Loosen them up, then roll again.</p>
      <div class="picker-result-actions">
        <button type="button" class="btn btn-primary" id="picker-empty-close">Got It</button>
      </div>
    </div>`;

  content().querySelector("#picker-empty-close").addEventListener("click", closePicker);
}
