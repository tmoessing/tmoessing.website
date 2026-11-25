/**
 * One-tap preset filters shown under the search bar. Each preset is a
 * predicate over a game; active presets combine with AND (Party + Big Group
 * = big party games) and with the search box. LibraryPage wires the clicks
 * and mirrors the active set into ?preset=.
 */
import { GAMES } from "../../data/games.js";
import { esc } from "../filters.js";

const has = (g, tag) => [...(g.tags || []), ...(g.categories || [])].includes(tag);

export const PRESETS = [
  {
    id: "anywhere",
    label: "Play Anywhere",
    emoji: "🙌",
    title: "Nothing needed but people, plus maybe paper and pens",
    // Paper-and-pencil games count only if they aren't a boxed product
    // (no BGG page), so The Game of Things stays out but Fishbowl is in.
    match: (g) => has(g, "No Props Needed") || (has(g, "Paper and Pencil") && !g.bggUrl)
  },
  {
    id: "party",
    label: "Party",
    emoji: "🎉",
    title: "Party games",
    match: (g) => has(g, "Party")
  },
  {
    id: "quick",
    label: "Quick",
    emoji: "⚡",
    title: "Done in 30 minutes or less",
    match: (g) => g.playtimeMax <= 30
  },
  {
    id: "big-group",
    label: "Big Group",
    emoji: "👯",
    title: "Plays 8 or more",
    match: (g) => g.maxPlayers >= 8
  },
  {
    id: "two-player",
    label: "Two Player",
    emoji: "👥",
    title: "Works with just 2 players",
    match: (g) => g.minPlayers <= 2
  },
  {
    id: "strategy",
    label: "Strategy",
    emoji: "🧠",
    title: "Strategy games",
    match: (g) => has(g, "Strategy")
  }
];

export function PresetFilters() {
  const chips = PRESETS.map((p) => {
    const count = GAMES.filter(p.match).length;
    return `
      <button type="button" class="preset-chip" data-preset="${p.id}" aria-pressed="false" title="${esc(p.title)}">
        <span class="preset-emoji" aria-hidden="true">${p.emoji}</span>
        <span>${esc(p.label)}</span>
        <span class="preset-count" aria-label="${count} games">${count}</span>
      </button>`;
  }).join("");
  return `<div class="preset-filters" role="group" aria-label="Quick filters">${chips}</div>`;
}
