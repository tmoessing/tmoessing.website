/**
 * Factory for a single board game card. Mirrors the site's card idiom
 * (build element, set innerHTML, return). The whole card and its button
 * both route to the shared game-details modal.
 */
import { CORE_CATEGORIES } from "../data/games.js";
import {
  tagPill,
  placeholderDataURI,
  playersLabel,
  playtimeLabel,
  complexityBadge,
  esc
} from "./filters.js";
import { icon } from "./icons.js";

export function createGameCard(game) {
  const card = document.createElement("div");
  card.className = "game-card";
  card.dataset.id = game.id;

  const cover = game.cover || placeholderDataURI(game.title);
  const fallback = placeholderDataURI(game.title);
  const tagsHTML = (game.tags || []).slice(0, 3).map(tagPill).join("");
  const catsHTML = (game.categories || [])
    .filter((c) => CORE_CATEGORIES.includes(c))
    .slice(0, 2)
    .map((c) => `<span class="skill-tag category-tag">${esc(c)}</span>`)
    .join("");

  card.innerHTML = `
    <div class="game-cover-wrap">
      <img class="game-cover" src="${esc(cover)}" alt="${esc(game.title)} cover"
           loading="lazy" onerror="this.onerror=null;this.src='${esc(fallback)}';">
      ${complexityBadge(game)}
    </div>
    <div class="game-card-body">
      <div class="game-card-main-info">
        <h3 class="game-card-title">${esc(game.title)}</h3>
        <div class="game-meta-row">
          <span class="game-meta">${icon("users")} ${playersLabel(game)} players</span>
          <span class="game-meta">${icon("clock")} ${playtimeLabel(game)}</span>
        </div>
      </div>
      <p class="game-card-desc">${esc(game.description || "")}</p>
      <div class="game-card-details-section">
        ${catsHTML ? `<div class="game-card-categories card-tags">${catsHTML}</div>` : ""}
        <div class="card-tags game-card-tags">${tagsHTML}</div>
      </div>
      <button class="btn btn-primary btn-sm game-view-btn" type="button" aria-label="View details for ${esc(game.title)}">View Details</button>
    </div>
  `;

  card.addEventListener("click", () => {
    if (typeof window.__openGameDetails === "function") window.__openGameDetails(game);
  });

  return card;
}
