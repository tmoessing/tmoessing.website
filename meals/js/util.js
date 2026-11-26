/**
 * Pure helpers for the meal library: HTML escaping, tag colors, a generated
 * cover placeholder, the meal match predicate + sort comparators, prep-time /
 * cost buckets, a tiny Markdown renderer, and Google Calendar helpers
 * (next-week day chooser, ingredient extraction, 5 PM event links).
 * No DOM state, no data imports — safe to reuse anywhere.
 */
import { illustratedCoverSVG } from "./placeholders.js";

/** Escape a string for safe use inside an HTML attribute or text node. */
export function esc(str) {
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/* ---------- display formatting ---------- */

/** "15 min" — blank when unknown. */
export function minutesLabel(mins) {
  const n = num(mins);
  return n > 0 ? `${n} min` : "—";
}

/** "$14" — rounds to whole dollars; blank when unknown. */
export function money(cost) {
  const n = num(cost);
  return n > 0 ? `$${Math.round(n)}` : "—";
}

/** "4 Servings" / "1 Serving". */
export function servingsLabel(servings) {
  const n = num(servings);
  if (n <= 0) return "—";
  return `${n} Serving${n === 1 ? "" : "s"}`;
}

/** Minutes a meal takes end to end (prefers totalTime, falls back to prep+cook). */
export function totalMinutes(meal) {
  const total = num(meal.totalTime);
  if (total > 0) return total;
  return num(meal.prepTime) + num(meal.cookTime);
}

/* ---------- tag colors (mirrors the site's Renderer.getTagStyle) ---------- */

export function getTagStyle(tagName) {
  if (!tagName) return { bg: "var(--bg-tertiary)", text: "var(--text-secondary)" };
  let hash = 0;
  for (let i = 0; i < tagName.length; i++) {
    hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = (Math.abs(hash) % 8) + 1;
  return { bg: `var(--tag-${index}-bg)`, text: `var(--tag-${index}-text)` };
}

/**
 * Inline SVG data-URI cover for a meal with no photo: an illustration for its
 * course (see placeholders.js), tinted per title. Real photos drop in later by
 * setting `image` on the data — no code change needed. Accepts a meal object,
 * or a bare title string (treated as a Main Course).
 */
export function placeholderDataURI(meal) {
  const m = typeof meal === "string" ? { title: meal } : meal || {};
  return "data:image/svg+xml," + encodeURIComponent(illustratedCoverSVG(m));
}

/* ---------- shuffle ---------- */

/** Fisher-Yates shuffle. Returns a new array. */
export function shuffle(list) {
  const arr = [...list];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/* ---------- filter buckets ---------- */

/** Resolve a time filter into a { lo, hi } minute bucket, or null for "any". */
export function timeBucket(filters) {
  switch (filters.time) {
    case "u15": return { lo: 0, hi: 15 };
    case "15-30": return { lo: 15, hi: 30 };
    case "30-60": return { lo: 30, hi: 60 };
    case "60+": return { lo: 60, hi: Infinity };
    case "custom": {
      const lo = Number.isFinite(filters.timeLo) ? filters.timeLo : 0;
      const hi = Number.isFinite(filters.timeHi) ? filters.timeHi : Infinity;
      return { lo, hi };
    }
    default: return null; // "any"
  }
}

/** Resolve a cost filter into a { lo, hi } dollar bucket, or null for "any". */
export function costBucket(filters) {
  switch (filters.cost) {
    case "budget": return { lo: 0, hi: 8 };
    case "u10": return { lo: 0, hi: 10 };
    case "10-20": return { lo: 10, hi: 20 };
    case "20+": return { lo: 20, hi: Infinity };
    case "custom": {
      const lo = Number.isFinite(filters.costLo) ? filters.costLo : 0;
      const hi = Number.isFinite(filters.costHi) ? filters.costHi : Infinity;
      return { lo, hi };
    }
    default: return null; // "any"
  }
}

/**
 * Does a meal satisfy the current filter state?
 * time: total minutes fall inside the bucket.
 * cost: estimatedCost falls inside the bucket.
 * servings: meal serves at least the requested number.
 * categories: OR — meal has at least one selected category (empty set => any).
 */
export function matchMeal(meal, filters) {
  const t = timeBucket(filters);
  if (t) {
    const mins = totalMinutes(meal);
    if (!(mins >= t.lo && mins <= t.hi)) return false;
  }

  const c = costBucket(filters);
  if (c) {
    const cost = num(meal.estimatedCost);
    if (!(cost >= c.lo && cost <= c.hi)) return false;
  }

  if (filters.servings && filters.servings !== "any") {
    const need = Number(filters.servings);
    if (!(num(meal.servings) >= need)) return false;
  }

  if (filters.categories && filters.categories.size > 0) {
    const has = (meal.categories || []).some((cat) => filters.categories.has(cat));
    if (!has) return false;
  }

  return true;
}

/* ---------- sorting ---------- */

/** Return a new, sorted array. key: alpha | time | cost | servings | random. */
export function sortMeals(meals, key) {
  const arr = [...meals];
  switch (key) {
    case "time":
      arr.sort((a, b) => totalMinutes(a) - totalMinutes(b));
      break;
    case "cost":
      arr.sort((a, b) => num(a.estimatedCost) - num(b.estimatedCost));
      break;
    case "servings":
      arr.sort((a, b) => num(a.servings) - num(b.servings));
      break;
    case "random":
      return shuffle(arr);
    case "alpha":
    default:
      arr.sort((a, b) => String(a.title).localeCompare(String(b.title)));
      break;
  }
  return arr;
}

/* ---------- grocery providers (extensible) ---------- */

/**
 * Resolve a meal's grocery-list link. Today only Walmart, but keyed by provider
 * so more can be added without touching the modal.
 */
export function groceryLink(meal, provider = "walmart") {
  const providers = { walmart: meal.walmartList };
  const url = providers[provider];
  return url && /^https?:\/\//i.test(url) ? url : null;
}

/** Walmart's multi-item cart link: items=ID|QTY,ID|QTY,... */
const WALMART_CART_URL = "https://affil.walmart.com/cart/addToCart?items=";

/**
 * Everyday pantry staples most kitchens already have. Matched against an
 * item's `for` label (lowercased, parenthetical notes dropped); these start
 * unchecked in the Walmart cart, just like "optional" items.
 */
const PANTRY_STAPLES = new Set([
  // Baking
  "flour", "sugar", "granulated sugar", "brown sugar", "dark brown sugar",
  "powdered sugar", "baking powder", "baking soda", "yeast", "active dry yeast",
  "vanilla", "cocoa",
  // Oils
  "oil", "vegetable oil", "olive oil",
  // Dried spices & herbs
  "chili powder", "cinnamon", "cumin", "paprika", "dried basil", "dried oregano",
  "dried parsley", "minced onion", "dehydrated onions", "accent",
  // Fridge & pantry basics
  "butter", "egg", "eggs", "milk", "rice", "chicken broth", "chicken stock"
]);

function isPantryStaple(label) {
  const key = String(label || "").toLowerCase().replace(/\(.*?\)/g, "").trim();
  return PANTRY_STAPLES.has(key);
}

/**
 * Merge the Walmart products of several meals. `entries` is [{ meal, times }];
 * quantities for the same product are summed across meals (and repeat days).
 * A product is optional (starts unchecked) only if every meal using it says
 * "optional" or lists it as a pantry staple.
 */
export function walmartItems(entries) {
  const byId = new Map();
  for (const { meal, times } of entries) {
    for (const item of meal.walmart || []) {
      const qty = (num(item.qty) || 1) * times;
      const optional = /\boptional\b/i.test(item.for || "") || isPantryStaple(item.for);
      const cur = byId.get(item.id);
      if (!cur) {
        byId.set(item.id, { ...item, qty, optional });
      } else {
        cur.qty += qty;
        if (cur.optional && !optional) cur.for = item.for;
        cur.optional = cur.optional && optional;
      }
    }
  }
  return [...byId.values()];
}

/** One link that adds the given products to the Walmart cart, or null if none. */
export function walmartCartUrl(items) {
  if (!items.length) return null;
  return WALMART_CART_URL + items.map((i) => `${encodeURIComponent(i.id)}|${i.qty}`).join(",");
}

/* ---------- Google Calendar ---------- */

function pad(n) {
  return String(n).padStart(2, "0");
}

/** YYYYMMDD for a local calendar date (Google's all-day event format). */
function fmtCalDay(d) {
  return String(d.getFullYear()).padStart(4, "0") + pad(d.getMonth() + 1) + pad(d.getDate());
}

/** UTC timestamp (YYYYMMDDTHHMMSSZ) for a timed Google Calendar event. */
function fmtCalDateTime(d) {
  return (
    String(d.getUTCFullYear()).padStart(4, "0") +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    "T" +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    "00Z"
  );
}

/** Meal-prep events start at 5:00 PM local time. */
export const PREP_START_HOUR = 17;

/**
 * The planning week: Monday through Sunday of the *next* week, i.e. starting
 * the first Monday after today (planning on a Saturday gives the Monday two
 * days out; planning on a Monday gives the Monday a week out).
 * Each entry: { date, key: "YYYYMMDD", label: "Mon", sub: "Dec 1" }.
 */
export function upcomingWeek(from = new Date()) {
  const today = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const daysToMonday = ((8 - today.getDay()) % 7) || 7; // getDay(): 0 = Sun, 1 = Mon
  const days = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + daysToMonday + i);
    days.push({
      date,
      key: fmtCalDay(date),
      label: date.toLocaleDateString(undefined, { weekday: "short" }),
      sub: date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    });
  }
  return days;
}

/** Strip inline Markdown (bold, italics, code, links) down to plain text. */
function plainText(md) {
  return md
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/(\*\*|__|\*|_|`)/g, "")
    .trim();
}

/**
 * Pull the ingredient lines out of a recipe body's "## Ingredients" section
 * (bullets or numbered items; "### Sauce"-style subheadings become "Sauce:").
 */
export function ingredientsFromBody(body) {
  const lines = String(body || "").split("\n");
  const out = [];
  let inSection = false;
  for (const raw of lines) {
    const line = raw.trim();
    if (/^##\s+/.test(line) && !/^###/.test(line)) {
      inSection = /^##\s+ingredients\b/i.test(line);
      continue;
    }
    if (!inSection || !line) continue;
    const sub = /^###\s+(.*)$/.exec(line);
    if (sub) { out.push(`${plainText(sub[1])}:`); continue; }
    const item = /^(?:[-*+]|\d+[.)])\s+(.*)$/.exec(line);
    if (item) out.push(plainText(item[1]));
  }
  return out;
}

/** Absolute URL back to a meal's deep-linked recipe on this page. */
export function recipeUrl(meal) {
  if (typeof location === "undefined") return "";
  return location.origin + location.pathname + "#" + encodeURIComponent(meal.slug);
}

/**
 * Google Calendar "TEMPLATE" link for one timed event starting at
 * PREP_START_HOUR (5 PM) local time on `day`. Opens a pre-filled event in a
 * new tab: no login, no backend, nothing saved until the user clicks Save.
 */
export function calendarEventUrl({ title, day, minutes, details }) {
  const start = new Date(day.getFullYear(), day.getMonth(), day.getDate(), PREP_START_HOUR, 0, 0);
  const end = new Date(start.getTime() + minutes * 60000);
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    // Local 5 PM converted to UTC, so it lands at 5 PM in the viewer's time zone.
    dates: `${fmtCalDateTime(start)}/${fmtCalDateTime(end)}`,
    details: details || ""
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Bulleted text for event notes, capped so links stay a sane length. */
export function bulletList(items, max = 40) {
  const shown = items.slice(0, max).map((i) => (i.endsWith(":") ? i : `• ${i}`));
  if (items.length > max) shown.push(`…plus ${items.length - max} more`);
  return shown.join("\n");
}

/**
 * Meal-prep event for one recipe on `day`: 5 PM, lasting the prep block
 * (prepDuration, else prep + cook, else 60 min), with the description, the
 * ingredient list (a shopping list), and a link back to the recipe.
 */
export function googleCalendarUrl(meal, day = new Date()) {
  const block = num(meal.prepDuration) || num(meal.prepTime) + num(meal.cookTime) || 60;

  const details = [];
  if (meal.description) details.push(meal.description);
  const timing = [];
  if (num(meal.prepTime)) timing.push(`prep ${num(meal.prepTime)}`);
  if (num(meal.cookTime)) timing.push(`cook ${num(meal.cookTime)}`);
  if (timing.length) details.push(`About ${block} min (${timing.join(", ")}).`);

  const ingredients = ingredientsFromBody(meal.body);
  if (ingredients.length) {
    const servings = num(meal.servings) ? ` (serves ${num(meal.servings)})` : "";
    details.push(`Ingredients${servings}:\n${bulletList(ingredients)}`);
  }

  const link = recipeUrl(meal);
  if (link) details.push(`Full recipe: ${link}`);

  return calendarEventUrl({
    title: `Meal Prep: ${meal.title}`,
    day,
    minutes: block,
    details: details.join("\n\n")
  });
}

/* ---------- Combined grocery list ---------- */

const UNITS = [
  "lb", "lbs", "pound", "pounds", "oz", "ounce", "ounces", "g", "kg", "ml", "l",
  "cup", "cups", "tbsp", "tablespoon", "tablespoons", "tsp", "teaspoon", "teaspoons",
  "clove", "cloves", "can", "cans", "package", "packages", "pkg", "bunch", "bunches",
  "slice", "slices", "stick", "sticks", "pinch", "dash", "large", "medium", "small"
];
const UNIT_ALIASES = {
  lbs: "lb", pound: "lb", pounds: "lb", ounce: "oz", ounces: "oz",
  cups: "cup", tablespoon: "tbsp", tablespoons: "tbsp", teaspoon: "tsp", teaspoons: "tsp",
  cloves: "clove", cans: "can", packages: "package", pkg: "package", bunches: "bunch",
  slices: "slice", sticks: "stick"
};
const PLURAL_UNITS = { lb: "lb", oz: "oz", cup: "cups", tbsp: "tbsp", tsp: "tsp", clove: "cloves",
  can: "cans", package: "packages", bunch: "bunches", slice: "slices", stick: "sticks" };

/** "1", "1.5", "1/2", "1 1/2" -> number, or NaN. */
function parseQty(str) {
  const t = str.trim();
  let m = /^(\d+)\s+(\d+)\/(\d+)$/.exec(t);
  if (m) return +m[1] + +m[2] / +m[3];
  m = /^(\d+)\/(\d+)$/.exec(t);
  if (m) return +m[1] / +m[2];
  return /^\d+(\.\d+)?$/.test(t) ? parseFloat(t) : NaN;
}

/** 2.5 -> "2 1/2", 0.333 -> "1/3", 1.2 -> "1.2". */
function formatQty(n) {
  const whole = Math.floor(n + 1e-9);
  const frac = n - whole;
  if (frac < 0.01) return String(whole);
  const nice = [[1 / 4, "1/4"], [1 / 3, "1/3"], [1 / 2, "1/2"], [2 / 3, "2/3"], [3 / 4, "3/4"]];
  for (const [v, label] of nice) {
    if (Math.abs(frac - v) < 0.02) return whole ? `${whole} ${label}` : label;
  }
  return String(Math.round(n * 100) / 100);
}

/**
 * Split "2 cloves garlic, minced" into { qty: 2, unit: "clove", name: "garlic",
 * rest: ", minced" }. Lines without a leading number get qty NaN.
 */
function parseIngredient(line) {
  const m = /^(\d+\s+\d+\/\d+|\d+\/\d+|\d+(?:\.\d+)?)\s+(.*)$/.exec(line);
  if (!m) return { qty: NaN, unit: "", name: line, rest: "" };
  let words = m[2];
  let unit = "";
  const um = /^([A-Za-z]+)\.?\s+(.*)$/.exec(words);
  if (um && UNITS.includes(um[1].toLowerCase())) {
    unit = UNIT_ALIASES[um[1].toLowerCase()] || um[1].toLowerCase();
    words = um[2];
  }
  const comma = words.indexOf(",");
  return {
    qty: parseQty(m[1]),
    unit,
    name: comma === -1 ? words.trim() : words.slice(0, comma).trim(),
    rest: comma === -1 ? "" : words.slice(comma)
  };
}

/**
 * Merge ingredient lines from several recipes into one shopping list.
 * `entries` is [{ meal, times }] (times = how many days that recipe is planned).
 * Same ingredient + unit is summed ("2 cloves garlic" + "3 cloves garlic" ->
 * "5 cloves garlic"); everything else is listed once with a ×N count.
 * Returns [{ key, text, meals: [titles] }], sorted by name.
 */
export function combineIngredients(entries) {
  const merged = new Map();
  for (const { meal, times } of entries) {
    for (const line of ingredientsFromBody(meal.body)) {
      if (line.endsWith(":")) continue; // "Sauce:" subheadings
      const p = parseIngredient(line);
      const key = `${p.unit}|${p.name.toLowerCase()}|${Number.isNaN(p.qty) ? line.toLowerCase() : ""}`;
      const cur = merged.get(key) || { key, qty: 0, count: 0, p, meals: [] };
      if (!Number.isNaN(p.qty)) cur.qty += p.qty * times;
      cur.count += times;
      if (!cur.meals.includes(meal.title)) cur.meals.push(meal.title);
      merged.set(key, cur);
    }
  }
  return [...merged.values()]
    .map((e) => {
      let text;
      if (Number.isNaN(e.p.qty)) {
        text = e.count > 1 ? `${e.p.name} (×${e.count})` : e.p.name;
      } else {
        const unit = e.p.unit ? ` ${e.qty > 1 ? PLURAL_UNITS[e.p.unit] || e.p.unit : e.p.unit}` : "";
        text = `${formatQty(e.qty)}${unit} ${e.p.name}${e.p.rest}`;
      }
      return { key: e.key, text, sortName: e.p.name.toLowerCase(), meals: e.meals };
    })
    .sort((a, b) => a.sortName.localeCompare(b.sortName))
    .map(({ key, text, meals }) => ({ key, text, meals }));
}

/* ---------- tiny Markdown renderer ---------- */

function boldAndEsc(raw) {
  return esc(raw).replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
}

function inline(raw) {
  let out = "";
  let rest = String(raw);
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/;
  let m;
  while ((m = linkRe.exec(rest))) {
    out += boldAndEsc(rest.slice(0, m.index));
    const text = m[1];
    const url = m[2].trim();
    const safe = /^(https?:|\/|\.\/|\.\.\/|#|mailto:)/i.test(url) ? url : "#";
    // "#slug" links jump to another recipe on this page; everything else opens a new tab.
    const attrs = safe.startsWith("#") ? "" : ` target="_blank" rel="noopener noreferrer"`;
    out += `<a href="${esc(safe)}"${attrs}>${boldAndEsc(text)}</a>`;
    rest = rest.slice(m.index + m[0].length);
  }
  out += boldAndEsc(rest);
  return out;
}

/**
 * Render a small, safe subset of Markdown: #/##/### headings, `-`/`*` bullets,
 * `1.` ordered steps, **bold**, and [text](url) links. Everything is escaped;
 * unknown syntax degrades to plain paragraphs. Enough for recipe bodies without
 * pulling in a Markdown dependency.
 */
export function renderMarkdown(md) {
  if (!md) return "";
  const lines = String(md).replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let listType = null;
  let para = [];

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };
  const flushPara = () => {
    if (para.length) {
      html.push(`<p>${inline(para.join(" "))}</p>`);
      para = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) {
      flushPara();
      closeList();
      continue;
    }
    let m;
    if ((m = /^###\s+(.*)$/.exec(line))) {
      flushPara(); closeList();
      html.push(`<h5 class="recipe-subheading">${inline(m[1])}</h5>`);
    } else if ((m = /^(##|#)\s+(.*)$/.exec(line))) {
      flushPara(); closeList();
      html.push(`<h4 class="recipe-heading" id="recipe-h-${slugify(m[2])}">${inline(m[2])}</h4>`);
    } else if ((m = /^[-*]\s+(.*)$/.exec(line))) {
      flushPara();
      if (listType !== "ul") { closeList(); listType = "ul"; html.push('<ul class="recipe-list">'); }
      html.push(`<li>${inline(m[1])}</li>`);
    } else if ((m = /^\d+\.\s+(.*)$/.exec(line))) {
      flushPara();
      if (listType !== "ol") { closeList(); listType = "ol"; html.push('<ol class="recipe-steps">'); }
      html.push(`<li>${inline(m[1])}</li>`);
    } else {
      para.push(line);
    }
  }
  flushPara();
  closeList();
  return html.join("\n");
}

/** lowercase-hyphen slug, used for in-modal heading anchors. */
export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
