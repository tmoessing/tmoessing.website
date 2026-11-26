/**
 * Shareable URL state for the game library.
 *
 *   ?game=<id>          open that game's details
 *   ?q=<text>           search text
 *   ?tags=Party,Memory  locked tag/category filters
 *   ?sort=playtime      sort order (omitted for the default A–Z)
 *   ?fav=1              personal favorites only
 *   ?preset=party,quick active preset filters
 *
 * Filters are written with replaceState (no history spam while typing).
 * Opening a game pushes a history entry so Back closes the details modal.
 */

function params() {
  return new URLSearchParams(window.location.search);
}

function urlWith(p) {
  const qs = p.toString();
  return window.location.pathname + (qs ? `?${qs}` : "") + window.location.hash;
}

export function readUrlState() {
  const p = params();
  return {
    game: p.get("game"),
    q: p.get("q") || "",
    tags: (p.get("tags") || "")
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    sort: p.get("sort") || "",
    fav: p.get("fav") === "1",
    presets: (p.get("preset") || "").split(",").map((t) => t.trim()).filter(Boolean)
  };
}

export function writeFilters({ q, tags, sort, fav, presets = [] }) {
  const p = params();
  q ? p.set("q", q) : p.delete("q");
  tags.length ? p.set("tags", tags.join(",")) : p.delete("tags");
  sort && sort !== "alpha" ? p.set("sort", sort) : p.delete("sort");
  fav ? p.set("fav", "1") : p.delete("fav");
  presets.length ? p.set("preset", presets.join(",")) : p.delete("preset");
  history.replaceState(history.state, "", urlWith(p));
}

/** Add ?game=id as a new history entry (so Back closes the modal). */
export function pushGame(id) {
  const p = params();
  p.set("game", id);
  history.pushState({ gameModal: true }, "", urlWith(p));
}

/** Drop ?game from the current entry without adding history. */
export function clearGame() {
  const p = params();
  if (!p.has("game")) return;
  p.delete("game");
  history.replaceState(null, "", urlWith(p));
}

/** A clean, absolute link to one game (no filters attached). */
export function gameLink(id) {
  const u = new URL(window.location.href);
  u.search = "";
  u.hash = "";
  u.searchParams.set("game", id);
  return u.toString();
}
