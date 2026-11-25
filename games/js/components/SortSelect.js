/**
 * Sort dropdown. Values must match the keys sortGames() understands.
 */
export const SORT_OPTIONS = [
  { value: "alpha", label: "Title (A–Z)" },
  { value: "playtime", label: "Playtime" },
  { value: "players", label: "Players" },
  { value: "complexity", label: "Complexity" }
];

export function SortSelect({ selected = "alpha" } = {}) {
  const options = SORT_OPTIONS.map(
    (o) => `<option value="${o.value}"${o.value === selected ? " selected" : ""}>${o.label}</option>`
  ).join("");

  return `
    <label>Sort
      <select id="library-sort" autocomplete="off">${options}</select>
    </label>
  `;
}
