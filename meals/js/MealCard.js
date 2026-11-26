/**
 * Factory for a single meal card. Cover on the left, info on the right, with
 * emoji info-chips (prep time / cost / servings) and colored category chips.
 * The whole card is a keyboard-operable button that opens the details modal.
 */
import {
  esc,
  getTagStyle,
  placeholderDataURI,
  minutesLabel,
  money,
  servingsLabel
} from "./util.js";

export function createMealCard(meal) {
  const card = document.createElement("article");
  card.className = "meal-card";
  card.dataset.slug = meal.slug;
  card.tabIndex = 0;
  card.setAttribute("role", "button");
  card.setAttribute("aria-label", `View recipe for ${meal.title}`);

  const cover = meal.image || placeholderDataURI(meal);
  const fallback = placeholderDataURI(meal);

  const cats = (meal.categories || [])
    .slice(0, 3)
    .map((c) => {
      const s = getTagStyle(c);
      return `<span class="skill-tag" style="background:${s.bg};color:${s.text};border-color:transparent;">🏷 ${esc(c)}</span>`;
    })
    .join("");

  card.innerHTML = `
    <div class="meal-cover-wrap">
      <img class="meal-cover" src="${esc(cover)}" alt="${esc(meal.title)}"
           loading="lazy" onerror="this.onerror=null;this.src='${esc(fallback)}';">
    </div>
    <div class="meal-card-body">
      <h3 class="meal-title">${esc(meal.title)}${meal.hidden === true ? ` <span class="meal-hidden-badge" title="Hidden: only shown with ?hidden in the address">🙈 Hidden</span>` : ""}</h3>
      <p class="meal-desc">${esc(meal.description || "")}</p>
      <div class="meal-chips">
        <span class="meal-chip" title="Prep time">⏱ ${esc(minutesLabel(meal.prepTime))}</span>
        <span class="meal-chip" title="Estimated cost">💲 ${esc(money(meal.estimatedCost))}</span>
        <span class="meal-chip" title="Servings">🍽 ${esc(servingsLabel(meal.servings))}</span>
      </div>
      ${cats ? `<div class="meal-cat-chips card-tags">${cats}</div>` : ""}
      <div class="meal-card-actions">
        <button class="btn btn-primary btn-sm meal-view-btn" type="button">📖 View Recipe</button>
        ${meal.walmart && meal.walmart.length ? `<button class="btn btn-secondary btn-sm meal-cart-btn" type="button" aria-label="Add to Walmart cart: ${esc(meal.title)}">🛒 Add to Walmart cart</button>` : ""}
      </div>
    </div>
  `;

  const open = (opts) => {
    if (typeof window.__openMealDetails === "function") window.__openMealDetails(meal, opts);
  };
  card.addEventListener("click", () => open());
  card.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  });

  // The cart button opens the recipe with its Walmart checklist showing.
  const cartBtn = card.querySelector(".meal-cart-btn");
  if (cartBtn) {
    cartBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      open({ showCart: true });
    });
    cartBtn.addEventListener("keydown", (e) => e.stopPropagation());
  }

  return card;
}
