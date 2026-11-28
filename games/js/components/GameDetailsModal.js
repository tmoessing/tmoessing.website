/**
 * Shared modal layer for the game library.
 *
 * - openModal(html) / closeModal(): generic overlay with backdrop + Escape +
 *   close-button dismissal and a fade/scale-in via the `.open` class.
 * - openGameDetails(game): renders a large details view into that modal and is
 *   exposed as window.__openGameDetails for cards to call. Opening a game adds
 *   ?game=<id> to the URL (a history entry, so Back closes it).
 * - lockScroll() / unlockScroll(): ref-counted body scroll lock, shared with
 *   the picker so stacked modals don't unlock the page prematurely.
 */
import {
  tagPill,
  placeholderDataURI,
  playersLabel,
  playtimeLabel,
  complexityBadge,
  favoriteStar,
  esc
} from "../filters.js";
import { icon } from "../icons.js";
import { pushGame, clearGame, gameLink } from "../urlState.js";

let scrollLocks = 0;
export function lockScroll() {
  scrollLocks += 1;
  document.body.style.overflow = "hidden";
}
export function unlockScroll() {
  scrollLocks = Math.max(0, scrollLocks - 1);
  if (scrollLocks === 0) document.body.style.overflow = "";
}

let overlay = null;
let returnFocusTo = null;
let currentGameId = null;
let pushedHistory = false; // did opening this modal add a history entry?

function onEsc(e) {
  if (e.key === "Escape") closeModal();
}

/** Remove the overlay and restore focus; no URL changes. */
function teardown() {
  if (!overlay) return;
  overlay.remove();
  overlay = null;
  currentGameId = null;
  window.__gameDetailsOpen = false;
  unlockScroll();
  document.removeEventListener("keydown", onEsc);
  if (returnFocusTo && document.contains(returnFocusTo)) returnFocusTo.focus();
  returnFocusTo = null;
}

export function openModal(html) {
  teardown();
  returnFocusTo = document.activeElement;
  overlay = document.createElement("div");
  overlay.className = "game-modal-overlay details-overlay";
  overlay.innerHTML = `
    <div class="game-modal" role="dialog" aria-modal="true">
      <button class="game-modal-close" type="button" aria-label="Close">✕</button>
      <div class="game-modal-body">${html}</div>
    </div>`;
  document.body.appendChild(overlay);
  lockScroll();
  window.__gameDetailsOpen = true;

  requestAnimationFrame(() => overlay && overlay.classList.add("open"));
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  overlay.querySelector(".game-modal-close").addEventListener("click", () => closeModal());
  document.addEventListener("keydown", onEsc);
  overlay.querySelector(".game-modal-close").focus();
}

/**
 * Close the modal. fromHistory: true when the browser's Back/Forward already
 * changed the URL (so we must not touch history again).
 */
export function closeModal({ fromHistory = false } = {}) {
  if (!overlay) return;
  const hadGame = currentGameId !== null;
  const pushed = pushedHistory;
  pushedHistory = false;
  teardown();
  if (fromHistory || !hadGame) return;
  // Undo our own history entry if we added one; otherwise (landed via a
  // shared link) just drop ?game so Back doesn't leave the site.
  if (pushed && history.state && history.state.gameModal) history.back();
  else clearGame();
}

/** Pull the 11-char video id out of a youtube.com/watch?v= URL, else null. */
function youTubeId(url) {
  const m = /[?&]v=([A-Za-z0-9_-]{11})/.exec(url || "");
  return m ? m[1] : null;
}

/**
 * "How to Play" section: a click-to-load video (thumbnail first, so opening
 * the modal doesn't pull in YouTube's player) followed by the rules summary.
 */
function howToPlayHTML(game) {
  const id = youTubeId(game.howToPlayVideo);
  const rules = game.howToPlay;
  if (!id && !rules) return "";

  const searchUrl =
    game.howToPlayVideo ||
    `https://www.youtube.com/results?search_query=how+to+play+${encodeURIComponent(game.title)}+board+game`;

  const video = id
    ? `<div class="howto-video">
        <button type="button" class="howto-video-thumb" data-video-id="${esc(id)}"
                aria-label="Play how-to-play video for ${esc(game.title)}">
          <img src="https://i.ytimg.com/vi/${esc(id)}/hqdefault.jpg" alt="" loading="lazy">
          <span class="howto-play-icon" aria-hidden="true">
            <svg viewBox="0 0 68 48"><path d="M66.5 7.7a8.6 8.6 0 0 0-6-6C55.2.3 34 .3 34 .3s-21.2 0-26.5 1.4a8.6 8.6 0 0 0-6 6C.1 13 .1 24 .1 24s0 11 1.4 16.3a8.6 8.6 0 0 0 6 6C12.8 47.7 34 47.7 34 47.7s21.2 0 26.5-1.4a8.6 8.6 0 0 0 6-6C67.9 35 67.9 24 67.9 24s0-11-1.4-16.3z" fill="#f00"/><path d="M45 24 27 14v20z" fill="#fff"/></svg>
          </span>
        </button>
      </div>`
    : `<p class="howto-search"><a href="${esc(searchUrl)}" target="_blank" rel="noopener noreferrer">Find a tutorial video on YouTube →</a></p>`;

  const steps = rules
    ? `${rules.goal ? `<p class="howto-goal"><strong>Goal:</strong> ${esc(rules.goal)}</p>` : ""}
       <ol class="howto-steps">${(rules.steps || []).map((s) => `<li>${esc(s)}</li>`).join("")}</ol>`
    : "";

  return `
    <section class="game-howto" aria-labelledby="howto-heading">
      <h3 id="howto-heading">How to Play</h3>
      ${video}
      ${steps}
    </section>`;
}

function detailsHTML(game) {
  const cover = game.cover || placeholderDataURI(game.title);
  const fallback = placeholderDataURI(game.title);
  const cats = (game.categories || [])
    .map((c) => `<span class="skill-tag">${esc(c)}</span>`)
    .join("");
  const tags = (game.tags || []).map(tagPill).join("");

  return `
    <div class="game-details">
      <div class="game-details-cover-wrap">
        <img class="game-details-cover" src="${esc(cover)}" alt="${esc(game.title)} cover"
             onerror="this.onerror=null;this.src='${esc(fallback)}';">
      </div>
      <div class="game-details-info">
        <div class="game-details-head">
          <h2 class="game-details-title">${favoriteStar(game, "icon-lg")}${esc(game.title)}</h2>
          ${complexityBadge(game)}
        </div>
        ${game.aka ? `<div class="game-details-aka">aka ${esc(game.aka)}</div>` : ""}
        <div class="game-meta-row">
          <span class="game-meta">${icon("users", "icon-md")} ${playersLabel(game)} players</span>
          <span class="game-meta">${icon("clock", "icon-md")} ${playtimeLabel(game)}</span>
          ${game.bggWeight ? `<span class="game-meta" title="BoardGameGeek complexity weight, 1 (light) to 5 (heavy)">BGG weight ${game.bggWeight.toFixed(2)} / 5</span>` : ""}
        </div>
        <p class="game-details-desc">${esc(game.description || "")}</p>
        <div class="game-details-links">
          ${game.bggUrl ? `<a href="${esc(game.bggUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm">${icon("globe", "icon-md")} BoardGameGeek</a>` : ""}
          <button type="button" class="btn btn-secondary btn-sm share-btn">${icon("share", "icon-md")} <span class="share-label">Share</span></button>
        </div>
        ${cats ? `<div class="game-details-section"><h4>Categories</h4><div class="card-tags">${cats}</div></div>` : ""}
        ${tags ? `<div class="game-details-section"><h4>Tags</h4><div class="card-tags">${tags}</div></div>` : ""}
      </div>
    </div>
    ${howToPlayHTML(game)}`;
}

/** Swap a video thumbnail for the real (privacy-enhanced) YouTube player. */
function wireVideo(root) {
  const thumb = root.querySelector(".howto-video-thumb");
  if (!thumb) return;
  thumb.addEventListener("click", () => {
    const iframe = document.createElement("iframe");
    iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(thumb.dataset.videoId)}?autoplay=1&rel=0`;
    iframe.title = thumb.getAttribute("aria-label").replace(/^Play /, "");
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    thumb.replaceWith(iframe);
  });
}

/** Native share sheet on phones; copy-to-clipboard everywhere else. */
function wireShare(root, game) {
  const btn = root.querySelector(".share-btn");
  if (!btn) return;
  const label = btn.querySelector(".share-label");
  const flash = (text) => {
    label.textContent = text;
    setTimeout(() => (label.textContent = "Share"), 2000);
  };

  btn.addEventListener("click", async () => {
    const url = gameLink(game.id);
    const coarse = window.matchMedia && window.matchMedia("(pointer: coarse)").matches;
    if (navigator.share && coarse) {
      try {
        await navigator.share({ title: `${game.title} — Game Library`, url });
      } catch (_) {
        /* user dismissed the share sheet */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      flash("Link copied!");
    } catch (_) {
      window.prompt("Copy this link:", url);
    }
  });
}

/**
 * Open a game's details. fromHistory: true when the URL already says
 * ?game=<id> (shared link or Back/Forward), so no new history entry.
 */
export function openGameDetails(game, { fromHistory = false } = {}) {
  if (currentGameId === game.id) return;
  openModal(detailsHTML(game));
  currentGameId = game.id;
  pushedHistory = !fromHistory;
  if (!fromHistory) pushGame(game.id);
  wireVideo(overlay);
  wireShare(overlay, game);
}

export function currentDetailsId() {
  return currentGameId;
}

// Cards call this globally so they don't each need an import wire-up.
window.__openGameDetails = (game) => openGameDetails(game);
