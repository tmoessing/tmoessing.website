/**
 * "Plan the Week": pick a recipe (or nothing) for each day of next week
 * (Mon–Sun), schedule a grocery shop or pickup, and get:
 *   - a Google Calendar button per planned day (5 PM meal-prep events)
 *   - a grocery-run calendar event carrying the combined shopping list
 *   - a step-through "Shop at Walmart" button over each recipe's Walmart list
 *     (Walmart can't merge lists by link, so the cart becomes the combined list)
 *   - one merged ingredient checklist with Copy
 *
 * The plan is saved in localStorage per week, so it survives closing the page
 * and resets on its own when a new planning week starts.
 */
import {
  esc,
  upcomingWeek,
  googleCalendarUrl,
  calendarEventUrl,
  combineIngredients,
  bulletList,
  groceryLink
} from "./util.js";
import { lockScroll, unlockScroll } from "./MealDetailsModal.js";

const STORE_KEY = "meal-week-plan";
const GROCERY = {
  shop: { label: "🛒 Shop", minutes: 60, title: "Grocery Shopping" },
  pickup: { label: "🚗 Pickup", minutes: 10, title: "Grocery Pickup" }
};

let overlay = null;
let MEALS = [];
let bySlug = {};
let week = [];
let plan = null;

/* ---------- persistence ---------- */

function emptyPlan(weekKey) {
  return { week: weekKey, days: {}, grocery: { type: "", day: "" }, shopped: [], checked: [] };
}

function loadPlan(weekKey) {
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
    if (saved && saved.week === weekKey) return { ...emptyPlan(weekKey), ...saved };
  } catch (_) {
    /* unreadable or blocked storage: start fresh */
  }
  return emptyPlan(weekKey);
}

function savePlan() {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(plan));
  } catch (_) {
    /* storage unavailable (private mode): the plan just won't persist */
  }
}

/* ---------- derived data ---------- */

/** Planned recipes in day order, each with how many days it's planned. */
function plannedEntries() {
  const counts = new Map();
  for (const d of week) {
    const meal = bySlug[plan.days[d.key]];
    if (meal) counts.set(meal.slug, (counts.get(meal.slug) || 0) + 1);
  }
  return [...counts].map(([slug, times]) => ({ meal: bySlug[slug], times }));
}

/** Days a grocery run can go on: today through the end of the plan week. */
function groceryDays() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const last = week[week.length - 1].date;
  const days = [];
  for (let d = new Date(start); d <= last; d.setDate(d.getDate() + 1)) {
    const date = new Date(d);
    const i = days.length;
    days.push({
      key: `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`,
      date,
      label:
        (i === 0 ? "Today, " : i === 1 ? "Tomorrow, " : "") +
        date.toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })
    });
  }
  return days;
}

/** Default grocery day: the day before the first planned meal (not before today). */
function defaultGroceryDay(days) {
  const first = week.find((d) => bySlug[plan.days[d.key]]) || week[0];
  const before = new Date(first.date.getFullYear(), first.date.getMonth(), first.date.getDate() - 1);
  const match = days.find((d) => d.date.getTime() === before.getTime());
  return (match || days[0]).key;
}

/* ---------- open / close ---------- */

export function openWeekPlanner(meals) {
  if (overlay) return;
  MEALS = [...(meals || [])].sort((a, b) => String(a.title).localeCompare(String(b.title)));
  bySlug = Object.fromEntries(MEALS.map((m) => [m.slug, m]));
  week = upcomingWeek();
  plan = loadPlan(week[0].key);

  overlay = document.createElement("div");
  overlay.className = "meal-modal-overlay planner-overlay";
  overlay.innerHTML = `
    <div class="meal-modal planner-modal" role="dialog" aria-modal="true" aria-label="Plan the week">
      <button class="meal-modal-close" type="button" aria-label="Close">✕</button>
      <div class="planner-content"></div>
    </div>`;
  document.body.appendChild(overlay);
  lockScroll();

  requestAnimationFrame(() => overlay && overlay.classList.add("open"));
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) closeWeekPlanner();
  });
  overlay.querySelector(".meal-modal-close").addEventListener("click", closeWeekPlanner);
  document.addEventListener("keydown", onEsc);

  render();
  overlay.querySelector(".meal-modal-close").focus();
}

function onEsc(e) {
  if (e.key === "Escape" && !window.__mealDetailsOpen) closeWeekPlanner();
}

export function closeWeekPlanner() {
  if (!overlay) return;
  overlay.remove();
  overlay = null;
  unlockScroll();
  document.removeEventListener("keydown", onEsc);
}

/* ---------- rendering ---------- */

function content() {
  return overlay.querySelector(".planner-content");
}

function render() {
  const entries = plannedEntries();
  const first = week[0].date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const last = week[6].date.toLocaleDateString(undefined, { month: "short", day: "numeric" });

  content().innerHTML = `
    <h2 class="planner-title">🗓️ Plan the Week</h2>
    <p class="planner-sub">Week of ${esc(first)} – ${esc(last)}. Pick a recipe for any day (or leave it empty).</p>

    <section class="planner-section">
      <h3>Meals</h3>
      <div class="planner-days">${week.map(dayRow).join("")}</div>
    </section>

    <section class="planner-section">
      <h3>Grocery run</h3>
      ${groceryHTML(entries)}
    </section>

    <section class="planner-section">
      <h3>Shop at Walmart</h3>
      ${walmartHTML(entries)}
    </section>

    <section class="planner-section">
      <h3>Combined ingredients</h3>
      ${ingredientsHTML(entries)}
    </section>

    <div class="planner-footer">
      <button type="button" class="btn btn-outline btn-sm" id="planner-clear">Clear plan</button>
    </div>`;
  wire(entries);
}

function dayRow(d) {
  const slug = plan.days[d.key] || "";
  const meal = bySlug[slug];
  const options = MEALS.map(
    (m) => `<option value="${esc(m.slug)}"${m.slug === slug ? " selected" : ""}>${esc(m.title)}</option>`
  ).join("");
  return `
    <div class="planner-day">
      <label class="planner-day-label" for="plan-${d.key}">
        <span class="planner-day-name">${esc(d.label)}</span>
        <span class="planner-day-date">${esc(d.sub)}</span>
      </label>
      <select id="plan-${d.key}" class="planner-select" data-day="${d.key}">
        <option value="">— No meal —</option>
        ${options}
      </select>
      ${
        meal
          ? `<a class="btn btn-secondary btn-sm planner-cal" href="${esc(googleCalendarUrl(meal, d.date))}" target="_blank" rel="noopener noreferrer"
               title="Add to Google Calendar (5 PM)" aria-label="Add ${esc(meal.title)} on ${esc(d.label)} to Google Calendar">📅</a>`
          : `<span class="planner-cal-spacer" aria-hidden="true"></span>`
      }
    </div>`;
}

function groceryHTML(entries) {
  const days = groceryDays();
  const type = plan.grocery.type;
  if (type && !days.some((d) => d.key === plan.grocery.day)) plan.grocery.day = defaultGroceryDay(days);

  const typeBtn = (val, label) =>
    `<button type="button" class="picker-pill${type === val ? " active" : ""}" data-grocery="${val}" aria-pressed="${type === val}">${label}</button>`;

  let detail = "";
  if (type) {
    const g = GROCERY[type];
    const day = days.find((d) => d.key === plan.grocery.day);
    const dayOptions = days
      .map((d) => `<option value="${d.key}"${d.key === plan.grocery.day ? " selected" : ""}>${esc(d.label)}</option>`)
      .join("");
    const cal = day ? groceryCalendarUrl(g, day.date, entries) : "";
    detail = `
      <div class="planner-grocery-row">
        <label>Day
          <select id="planner-grocery-day" class="planner-select">${dayOptions}</select>
        </label>
        <a class="btn btn-secondary btn-sm" href="${esc(cal)}" target="_blank" rel="noopener noreferrer">📅 Add ${esc(g.title.toLowerCase())} to calendar</a>
      </div>
      <p class="planner-note">5:00 PM, ${g.minutes} min. ${entries.length ? "The shopping list goes in the event notes." : "Plan some meals to put the shopping list in the event notes."}</p>`;
  }

  return `
    <div class="pill-row" role="group" aria-label="Grocery run type">
      ${typeBtn("", "None")}
      ${typeBtn("shop", `${GROCERY.shop.label} (${GROCERY.shop.minutes / 60} hr)`)}
      ${typeBtn("pickup", `${GROCERY.pickup.label} (${GROCERY.pickup.minutes} min)`)}
    </div>
    ${detail}`;
}

function groceryCalendarUrl(g, day, entries) {
  const details = [];
  const meals = entries.map((e) => e.meal.title + (e.times > 1 ? ` ×${e.times}` : ""));
  if (meals.length) details.push(`For: ${meals.join(", ")}`);
  const items = combineIngredients(entries).map((i) => i.text);
  if (items.length) details.push(`Shopping list:\n${bulletList(items, 60)}`);
  const lists = entries
    .map((e) => [e.meal.title, groceryLink(e.meal, "walmart")])
    .filter(([, url]) => url)
    .map(([title, url]) => `${title}: ${url}`);
  if (lists.length) details.push(`Walmart lists:\n${lists.join("\n")}`);
  return calendarEventUrl({ title: g.title, day, minutes: g.minutes, details: details.join("\n\n") });
}

function walmartHTML(entries) {
  if (!entries.length) return `<p class="planner-note">Plan some meals and their Walmart lists show up here.</p>`;
  const withList = entries.filter((e) => groceryLink(e.meal, "walmart"));
  const without = entries.filter((e) => !groceryLink(e.meal, "walmart"));
  plan.shopped = plan.shopped.filter((s) => withList.some((e) => e.meal.slug === s));

  let main = "";
  if (withList.length) {
    const next = withList.find((e) => !plan.shopped.includes(e.meal.slug));
    const done = withList.length - withList.filter((e) => !plan.shopped.includes(e.meal.slug)).length;
    main = next
      ? `<a class="btn btn-primary" id="planner-walmart-next" data-slug="${esc(next.meal.slug)}"
            href="${esc(groceryLink(next.meal, "walmart"))}" target="_blank" rel="noopener noreferrer">
           🛒 Open ${esc(next.meal.title)} list (${done + 1} of ${withList.length})</a>
         <p class="planner-note">On Walmart, tap <strong>Add all to cart</strong>, then come back for the next list. Your cart becomes the week's combined list.</p>`
      : `<p class="planner-done">✓ All ${withList.length} Walmart list${withList.length === 1 ? "" : "s"} opened. Check your cart!</p>
         <button type="button" class="btn btn-outline btn-sm" id="planner-walmart-reset">Start over</button>`;
    main += `<ul class="planner-shoplist">${withList
      .map((e) => `<li class="${plan.shopped.includes(e.meal.slug) ? "done" : ""}">${plan.shopped.includes(e.meal.slug) ? "✓" : "○"} ${esc(e.meal.title)}</li>`)
      .join("")}</ul>`;
  }
  const missing = without.length
    ? `<p class="planner-note">No Walmart list yet for: ${without.map((e) => esc(e.meal.title)).join(", ")}. Add its link as <code>walmartList:</code> in the recipe file.</p>`
    : "";
  return main + missing;
}

function ingredientsHTML(entries) {
  const items = combineIngredients(entries);
  if (!items.length) return `<p class="planner-note">Plan some meals to build the list.</p>`;
  const checked = new Set(plan.checked);
  return `
    <ul class="planner-ingredients">
      ${items
        .map(
          (i) => `<li><label>
            <input type="checkbox" data-item="${esc(i.key)}"${checked.has(i.key) ? " checked" : ""}>
            <span class="planner-item-text">${esc(i.text)}</span>
            ${i.meals.length > 1 ? `<span class="planner-item-meals">${esc(i.meals.join(" · "))}</span>` : ""}
          </label></li>`
        )
        .join("")}
    </ul>
    <button type="button" class="btn btn-secondary btn-sm" id="planner-copy">📋 Copy list</button>
    <span class="planner-copied" id="planner-copied" aria-live="polite"></span>`;
}

/* ---------- events ---------- */

function wire(entries) {
  const root = content();

  root.querySelectorAll(".planner-select[data-day]").forEach((sel) =>
    sel.addEventListener("change", () => {
      if (sel.value) plan.days[sel.dataset.day] = sel.value;
      else delete plan.days[sel.dataset.day];
      savePlan();
      render();
      const again = content().querySelector(`#plan-${sel.dataset.day}`);
      if (again) again.focus();
    })
  );

  root.querySelectorAll("[data-grocery]").forEach((btn) =>
    btn.addEventListener("click", () => {
      plan.grocery.type = btn.dataset.grocery;
      if (plan.grocery.type && !plan.grocery.day) plan.grocery.day = defaultGroceryDay(groceryDays());
      savePlan();
      render();
    })
  );

  const gDay = root.querySelector("#planner-grocery-day");
  if (gDay)
    gDay.addEventListener("change", () => {
      plan.grocery.day = gDay.value;
      savePlan();
      render();
    });

  const next = root.querySelector("#planner-walmart-next");
  if (next)
    next.addEventListener("click", () => {
      // The link itself opens Walmart in a new tab; advance the step-through.
      plan.shopped.push(next.dataset.slug);
      savePlan();
      setTimeout(render, 0);
    });
  const reset = root.querySelector("#planner-walmart-reset");
  if (reset)
    reset.addEventListener("click", () => {
      plan.shopped = [];
      savePlan();
      render();
    });

  root.querySelectorAll(".planner-ingredients input[type=checkbox]").forEach((box) =>
    box.addEventListener("change", () => {
      const set = new Set(plan.checked);
      box.checked ? set.add(box.dataset.item) : set.delete(box.dataset.item);
      plan.checked = [...set];
      savePlan();
    })
  );

  const copy = root.querySelector("#planner-copy");
  if (copy)
    copy.addEventListener("click", async () => {
      const text = combineIngredients(entries)
        .map((i) => `${plan.checked.includes(i.key) ? "☑" : "☐"} ${i.text}`)
        .join("\n");
      const note = root.querySelector("#planner-copied");
      try {
        await navigator.clipboard.writeText(text);
        note.textContent = "Copied!";
      } catch (_) {
        window.prompt("Copy your list:", text);
      }
      setTimeout(() => (note.textContent = ""), 2000);
    });

  root.querySelector("#planner-clear").addEventListener("click", () => {
    if (!window.confirm("Clear this week's plan?")) return;
    plan = emptyPlan(week[0].key);
    savePlan();
    render();
  });
}
