/**
 * Shared modal layer for the game library.
 *
 * - openModal(html) / closeModal(): generic overlay with backdrop + Escape +
 *   close-button dismissal and a fade/scale-in via the `.open` class.
 * - openGameDetails(game): renders a large details view into that modal and is
 *   exposed as window.__openGameDetails for cards to call.
 * - lockScroll() / unlockScroll(): ref-counted body scroll lock, shared with
 *   the picker so stacked modals don't unlock the page prematurely.
 */
import {
  getTagStyle,
  placeholderDataURI,
  complexityLabel,
  esc
} from "./filters.js";

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

function onEsc(e) {
  if (e.key === "Escape") closeModal();
}

export function openModal(html) {
  closeModal();
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

  requestAnimationFrame(() => overlay.classList.add("open"));
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeModal();
  });
  overlay.querySelector(".game-modal-close").addEventListener("click", closeModal);
  document.addEventListener("keydown", onEsc);
  overlay.querySelector(".game-modal-close").focus();
}

export function closeModal() {
  if (!overlay) return;
  overlay.remove();
  overlay = null;
  window.__gameDetailsOpen = false;
  unlockScroll();
  document.removeEventListener("keydown", onEsc);
  if (returnFocusTo && document.contains(returnFocusTo)) returnFocusTo.focus();
  returnFocusTo = null;
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
function howToPlayHTML(game, videoUrl) {
  const id = youTubeId(game.howToPlayVideo);
  const rules = game.howToPlay;
  if (!id && !rules) return "";

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
    : `<p class="howto-search"><a href="${esc(videoUrl)}" target="_blank" rel="noopener noreferrer">Find a tutorial video on YouTube →</a></p>`;

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

function detailsHTML(game) {
  const cover = game.cover || placeholderDataURI(game.title);
  const fallback = placeholderDataURI(game.title);
  const players =
    game.minPlayers === game.maxPlayers
      ? `${game.minPlayers}`
      : `${game.minPlayers}–${game.maxPlayers}`;
  const videoUrl =
    game.howToPlayVideo ||
    `https://www.youtube.com/results?search_query=how+to+play+${encodeURIComponent(game.title)}+board+game`;
  const time =
    game.playtimeMin === game.playtimeMax
      ? `${game.playtimeMin} min`
      : `${game.playtimeMin}–${game.playtimeMax} min`;

  const cats = (game.categories || [])
    .map((c) => `<span class="skill-tag">${esc(c)}</span>`)
    .join("");
  const tags = (game.tags || [])
    .map((t) => {
      const s = getTagStyle(t);
      return `<span class="skill-tag" style="background:${s.bg};color:${s.text};border-color:transparent;">${esc(t)}</span>`;
    })
    .join("");

  return `
    <div class="game-details">
      <div class="game-details-cover-wrap">
        <img class="game-details-cover" src="${esc(cover)}" alt="${esc(game.title)} cover"
             onerror="this.onerror=null;this.src='${esc(fallback)}';">
      </div>
      <div class="game-details-info">
        <div class="game-details-head">
          <h2 class="game-details-title">${esc(game.title)}</h2>
          ${game.complexity ? `<span class="complexity-badge ${esc(game.complexity)}">${esc(complexityLabel(game.complexity))}</span>` : ""}
        </div>
        <div class="game-meta-row">
          <span class="game-meta" style="display: inline-flex; align-items: center; gap: 4px;">
            <svg class="icon icon-stroke" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:0.95rem; height:0.95rem; stroke:var(--text-muted);"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            ${players} players
          </span>
          <span class="game-meta" style="display: inline-flex; align-items: center; gap: 4px;">
            <svg class="icon icon-stroke" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="width:0.95rem; height:0.95rem; stroke:var(--text-muted);"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${time}
          </span>
          ${game.bggWeight ? `<span class="game-meta" title="BoardGameGeek complexity weight, 1 (light) to 5 (heavy)">BGG weight ${game.bggWeight.toFixed(2)} / 5</span>` : ""}
        </div>
        <p class="game-details-desc">${esc(game.description || "")}</p>
        <div class="game-details-links">
          ${game.bggUrl ? `<a href="${esc(game.bggUrl)}" target="_blank" rel="noopener noreferrer" class="btn btn-secondary btn-sm bgg-link"><svg class="icon icon-stroke" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:0.95rem; height:0.95rem;"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> BoardGameGeek</a>` : ""}
        </div>
        ${cats ? `<div class="game-details-section"><h4>Categories</h4><div class="card-tags">${cats}</div></div>` : ""}
        ${tags ? `<div class="game-details-section"><h4>Tags</h4><div class="card-tags">${tags}</div></div>` : ""}
      </div>
    </div>
    ${howToPlayHTML(game, videoUrl)}`;
}

export function openGameDetails(game) {
  openModal(detailsHTML(game));
  if (overlay) wireVideo(overlay);
}

// Cards call this globally so they don't each need an import wire-up.
window.__openGameDetails = openGameDetails;
