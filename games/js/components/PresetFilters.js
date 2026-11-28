/**
 * One-tap preset filters shown under the search bar. Each preset is a
 * predicate over a game; active presets combine with AND (Party + Big Group
 * = big party games) and with the search box. LibraryPage wires the clicks
 * and mirrors the active set into ?preset=.
 *
 * Digital games (tagged "Video Game": Jackbox, Among Us, Spaceteam) are
 * hidden by default. They show up when a preset with `reveal: true` is on
 * (Online & Apps, Over Zoom), or when the user searches or locks a tag.
 */
import { GAMES } from "../../data/games.js";
import { esc } from "../filters.js";

const has = (g, tag) => [...(g.tags || []), ...(g.categories || [])].includes(tag);

/** Digital games are hidden from the default view. */
export const isDigital = (g) => has(g, "Video Game");

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
    id: "deck",
    label: "Just Need a Deck",
    emoji: "🃏",
    title: "Playable with a standard 52-card deck",
    match: (g) => has(g, "Classic Deck")
  },
  {
    id: "zoom",
    label: "Over Zoom",
    emoji: "💻",
    title: "Works over a video call, including online games",
    reveal: true,
    match: (g) => has(g, "Zoom Friendly")
  },
  {
    id: "online",
    label: "Online & Apps",
    emoji: "📱",
    title: "Video games and phone apps (hidden by default)",
    reveal: true,
    match: (g) => isDigital(g)
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
    title: "Plays 10 or more",
    match: (g) => g.maxPlayers >= 10
  },
  {
    id: "two-player",
    label: "Two Player",
    emoji: "👥",
    title: "Works with just 2 players",
    match: (g) => g.minPlayers <= 2
  },
  {
    id: "teams",
    label: "Teams",
    emoji: "🤝",
    title: "Work together with your team against the other team",
    match: (g) => has(g, "Team Play")
  },
  {
    id: "social-deduction",
    label: "Social Deduction",
    emoji: "🕵️",
    title: "Secret roles, bluffing, and figuring out who's lying",
    match: (g) => has(g, "Social Deduction")
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
    // Non-revealing chips only ever show in-person games, so count those.
    const count = GAMES.filter((g) => p.match(g) && (p.reveal || !isDigital(g))).length;
    return `
      <button type="button" class="preset-chip" data-preset="${p.id}" aria-pressed="false" title="${esc(p.title)}">
        <span class="preset-emoji" aria-hidden="true">${p.emoji}</span>
        <span>${esc(p.label)}</span>
        <span class="preset-count" aria-label="${count} games">${count}</span>
      </button>`;
  }).join("");
  return `<div class="preset-filters" role="group" aria-label="Quick filters">${chips}</div>`;
}
