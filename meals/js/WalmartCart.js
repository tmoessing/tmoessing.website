/**
 * Walmart cart checklist, shared by the recipe modal and the week planner:
 * tick the products you need, then one link adds just those to the cart.
 */
import { esc, walmartCartUrl } from "./util.js";

/** Optional products start unticked; everything else starts ticked. */
function startsChecked(item, saved) {
  return Object.hasOwn(saved, item.id) ? saved[item.id] : !item.optional;
}

/**
 * @param {object[]} items - from walmartItems()
 * @param {object} saved - { [id]: boolean } choices that override the defaults
 */
export function walmartCartHTML(items, saved = {}) {
  const rows = items
    .map(
      (i) => `<li><label>
        <input type="checkbox" data-walmart-id="${esc(i.id)}"${startsChecked(i, saved) ? " checked" : ""}>
        <span class="planner-item-text">${i.qty > 1 ? `${i.qty} × ` : ""}${esc(i.name || i.for)}</span>
        ${i.for ? `<span class="planner-item-meals">${esc(i.for)}</span>` : ""}
      </label></li>`
    )
    .join("");
  return `
    <div class="walmart-cart">
      <p class="planner-note">Uncheck anything you already have.</p>
      <ul class="planner-ingredients walmart-items">${rows}</ul>
      <div class="walmart-cart-actions">
        <a class="btn btn-primary btn-sm walmart-add" target="_blank" rel="noopener noreferrer"></a>
        <button type="button" class="btn btn-outline btn-sm walmart-all"></button>
      </div>
    </div>`;
}

/**
 * Keep the link in step with the checkboxes.
 * @param {function} onChange - called with { [id]: boolean } after each change
 */
export function wireWalmartCart(root, items, { label, onChange } = {}) {
  const box = root.querySelector(".walmart-cart");
  if (!box) return;
  const checks = [...box.querySelectorAll("[data-walmart-id]")];
  const link = box.querySelector(".walmart-add");
  const all = box.querySelector(".walmart-all");

  const update = () => {
    const on = new Set(checks.filter((c) => c.checked).map((c) => c.dataset.walmartId));
    const url = walmartCartUrl(items.filter((i) => on.has(i.id)));
    if (url) {
      link.href = url;
      link.removeAttribute("aria-disabled");
    } else {
      link.removeAttribute("href"); // nothing ticked: not a link
      link.setAttribute("aria-disabled", "true");
    }
    link.textContent = `🛒 ${label} (${on.size} of ${items.length})`;
    all.textContent = on.size === items.length ? "Uncheck all" : "Check all";
  };
  const changed = () => {
    update();
    if (onChange) onChange(Object.fromEntries(checks.map((c) => [c.dataset.walmartId, c.checked])));
  };

  checks.forEach((c) => c.addEventListener("change", changed));
  all.addEventListener("click", () => {
    const value = checks.some((c) => !c.checked);
    checks.forEach((c) => (c.checked = value));
    changed();
  });
  update();
}
