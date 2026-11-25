/**
 * Segmented control for the grid layout. LibraryPage reads data-view and
 * keeps .active / aria-pressed in sync with the stored choice.
 */
import { icon } from "../icons.js";

export const VIEW_OPTIONS = [
  { view: "grid", icon: "grid", label: "Large cards" },
  { view: "compact", icon: "compact", label: "Small cards" },
  { view: "list", icon: "list", label: "Compact list" }
];

export function ViewToggle({ active = "grid" } = {}) {
  const buttons = VIEW_OPTIONS.map((o) => {
    const on = o.view === active;
    return `
      <button type="button" id="view-${o.view}" class="view-btn${on ? " active" : ""}"
              data-view="${o.view}" aria-label="${o.label}" title="${o.label}" aria-pressed="${on}">
        ${icon(o.icon)}
      </button>`;
  }).join("");

  return `<div class="view-toggle" role="group" aria-label="View mode">${buttons}</div>`;
}
