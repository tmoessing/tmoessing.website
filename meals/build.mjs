/**
 * meals/build.mjs — regenerate meals/data/meals.json from the Markdown sources.
 *
 * Reads every meals/data/*.md, splits the `--- ... ---` YAML frontmatter from
 * the Markdown body, parses the documented YAML subset (scalars, `- ` lists,
 * one level of nested map for `nutrition`), derives `slug` + `totalTime`, and
 * writes a single bundle the page fetches once.
 *
 * IMPORTANT: every frontmatter key is copied through verbatim, so future fields
 * (rating, timesCooked, lastCooked, difficulty, favorite, macros, …) ride along
 * with no code change — the UI just reads them where it's wired.
 *
 * Also:
 *   - fills in `image` automatically from meals/images/<slug>.(jpg|jpeg|png|webp)
 *   - derives `totalTime` (prep + cook) when it isn't set
 *   - skips files starting with "_" (drafts) and README.md
 *   - prints warnings for missing required fields, misspelled field names,
 *     unknown categories, missing photos, and missing recipe sections
 *
 * Runs automatically on every deploy (see .github/workflows/static.yml), so
 * adding a recipe is just adding a .md file. See meals/README.md.
 *
 * Run locally:  node meals/build.mjs           (warnings only)
 *               node meals/build.mjs --strict  (exit 1 if there are warnings)
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(HERE, "data");
const IMAGE_DIR = join(HERE, "images");
const OUT = join(DATA_DIR, "meals.json");
const IMAGE_EXTS = ["jpg", "jpeg", "png", "webp"];
const STRICT = process.argv.includes("--strict");

// Every field the template documents. Unknown keys still pass through to the
// JSON (so new fields need no code change), but get a "did you mean" warning
// in case they're a typo like `prepTme`.
const KNOWN_FIELDS = [
  "title", "description", "prepTime", "cookTime", "totalTime", "servings",
  "estimatedCost", "categories", "tags", "image", "walmartList", "recipeSource",
  "prepDuration", "nutrition",
  // reserved for future UI features
  "rating", "timesCooked", "lastCooked", "difficulty", "favorite"
];
const REQUIRED = ["title", "description", "prepTime", "cookTime", "servings"];
const NUMERIC = ["prepTime", "cookTime", "totalTime", "servings", "estimatedCost", "prepDuration"];

// Courses: the quick-filter chips on the library page (must also be in CATEGORIES).
const COURSES = ["Breakfast", "Main Course", "Dessert"];

// Canonical category taxonomy — the single source the picker + validation read.
const CATEGORIES = [
  "Breakfast", "Main Course", "Snack", "Dessert",
  "High Protein", "Low Carb", "Vegetarian", "Vegan", "Gluten Free",
  "Chicken", "Beef", "Pork", "Seafood",
  "Pasta", "Rice",
  "Mexican", "Italian", "Asian", "American",
  "Healthy", "Comfort Food",
  "Slow Cooker", "Air Fryer", "Grill",
  "Meal Prep", "Budget Friendly", "Quick Meals"
];

function stripQuotes(v) {
  const t = v.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  return t;
}

function stripComment(v) {
  // Drop trailing "# ..." comments on unquoted scalars (e.g. TODO placeholders).
  const t = v.trim();
  if (t.startsWith("#")) return "";
  if (t.startsWith('"') || t.startsWith("'")) return t; // keep quoted values intact
  const i = t.indexOf(" #");
  return i === -1 ? t : t.slice(0, i).trim();
}

function coerce(raw) {
  const v = stripQuotes(raw);
  if (v === "") return "";
  if (v === "true") return true;
  if (v === "false") return false;
  if (/^-?\d+$/.test(v)) return parseInt(v, 10);
  if (/^-?\d+\.\d+$/.test(v)) return parseFloat(v);
  return v;
}

function parseFrontmatter(fm) {
  const lines = fm.split("\n");
  const obj = {};
  let curKey = null;
  let curType = null; // "array" | "object" | null

  for (const rawLine of lines) {
    if (!rawLine.trim()) continue;
    const indent = rawLine.length - rawLine.trimStart().length;
    const line = rawLine.trim();

    if (indent === 0) {
      const m = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
      if (!m) continue;
      const key = m[1];
      const val = stripComment(m[2]);
      if (val === "") {
        obj[key] = null; // container to be filled by nested lines
        curKey = key;
        curType = null;
      } else {
        obj[key] = coerce(val);
        curKey = null;
        curType = null;
      }
    } else if (curKey) {
      const li = /^-\s+(.*)$/.exec(line);
      if (li) {
        if (curType !== "array") { obj[curKey] = []; curType = "array"; }
        obj[curKey].push(coerce(stripComment(li[1])));
      } else {
        const mm = /^([A-Za-z0-9_]+):\s*(.*)$/.exec(line);
        if (mm) {
          if (curType !== "object") { obj[curKey] = {}; curType = "object"; }
          obj[curKey][mm[1]] = coerce(stripComment(mm[2]));
        }
      }
    }
  }
  return obj;
}

/** Levenshtein distance, for "did you mean" suggestions on field typos. */
function editDistance(a, b) {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)
      );
    }
  }
  return dp[a.length][b.length];
}

function closest(word, options) {
  let best = null;
  let bestD = Infinity;
  for (const o of options) {
    const d = editDistance(word, o);
    if (d < bestD) { best = o; bestD = d; }
  }
  // Scale with length so short words only match near-misses (Dinnr→Dinner, not Soup→Pork).
  return bestD <= Math.max(1, Math.floor(word.length / 3)) ? best : null;
}

/** meals/images/<slug>.<ext> if a photo exists, else null. */
function findImage(slug) {
  for (const ext of IMAGE_EXTS) {
    if (existsSync(join(IMAGE_DIR, `${slug}.${ext}`))) return `../meals/images/${slug}.${ext}`;
  }
  return null;
}

/** Return human-readable problems with one parsed meal (empty if none). */
function validate(meal, file) {
  const problems = [];
  for (const key of REQUIRED) {
    if (meal[key] === undefined || meal[key] === null || meal[key] === "") {
      problems.push(`missing required field \`${key}\``);
    }
  }
  for (const key of NUMERIC) {
    const v = meal[key];
    if (v !== undefined && v !== null && v !== "" && typeof v !== "number") {
      problems.push(`\`${key}\` should be a number (got "${v}")`);
    }
  }
  for (const key of Object.keys(meal)) {
    if (["slug", "body"].includes(key) || key.startsWith("_") || KNOWN_FIELDS.includes(key)) continue;
    const guess = closest(key, KNOWN_FIELDS);
    problems.push(
      guess
        ? `unknown field \`${key}\` — did you mean \`${guess}\`?`
        : `unknown field \`${key}\` (kept, but nothing displays it yet)`
    );
  }
  if (!meal.categories.length) problems.push("no categories (it won't show up in category filters)");
  meal.categories.forEach((c) => {
    if (!CATEGORIES.includes(c)) {
      // Lunch and Dinner were merged into Main Course.
      const guess = ["lunch", "dinner"].includes(String(c).toLowerCase()) ? "Main Course" : closest(c, CATEGORIES);
      problems.push(`category "${c}" isn't in the list${guess ? ` — did you mean "${guess}"?` : ""}`);
    }
  });
  if (!/^[a-z0-9]+(-[a-z0-9]+)*\.md$/.test(file)) {
    problems.push("file name should be lowercase-with-dashes.md (it becomes the recipe's link)");
  }
  if (!/^##\s+Ingredients/im.test(meal.body)) problems.push("no `## Ingredients` section");
  if (!/^##\s+Instructions/im.test(meal.body)) problems.push("no `## Instructions` section");
  return problems;
}

function parseMeal(file, text) {
  const slug = file.replace(/\.md$/i, "");
  const normalized = text.replace(/\r\n/g, "\n");
  const m = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(normalized);
  if (!m) {
    console.warn(`  ! ${file}: no frontmatter block, skipping`);
    return null;
  }
  const meal = parseFrontmatter(m[1]);
  meal.slug = slug;
  meal.body = m[2].trim();

  const prep = Number(meal.prepTime) || 0;
  const cook = Number(meal.cookTime) || 0;
  if (!meal.totalTime) meal.totalTime = prep + cook;

  // normalize empty container keys
  if (meal.categories == null) meal.categories = [];
  if (meal.tags == null) meal.tags = [];
  // drop blank optional fields (e.g. `walmartList:` left empty) so the UI
  // hides those buttons and the JSON stays clean
  for (const [k, v] of Object.entries(meal)) {
    if (v === null || v === "") delete meal[k];
  }

  // Photo: an explicit `image:` wins; otherwise use images/<slug>.* if present.
  // A missing photo is fine — the UI shows a generated placeholder.
  if (meal.image) {
    const local = /^\.\.\/meals\/images\/(.+)$/.exec(meal.image);
    if (local && !existsSync(join(IMAGE_DIR, local[1]))) {
      meal._imageMissing = local[1];
      delete meal.image;
    }
  } else {
    delete meal.image;
    const found = findImage(slug);
    if (found) meal.image = found;
  }

  return meal;
}

function build() {
  const files = readdirSync(DATA_DIR).filter(
    (f) => f.toLowerCase().endsWith(".md") && !f.startsWith("_") && f.toLowerCase() !== "readme.md"
  );
  const meals = [];
  let warningCount = 0;

  for (const file of files) {
    const text = readFileSync(join(DATA_DIR, file), "utf8");
    const meal = parseMeal(file, text);
    if (!meal) { warningCount++; continue; }
    if (!meal.title) {
      console.warn(`  ! ${file}: missing title, skipping`);
      warningCount++;
      continue;
    }
    const problems = validate(meal, file);
    if (meal._imageMissing) {
      problems.push(`image "${meal._imageMissing}" not found in meals/images/ (using placeholder)`);
      delete meal._imageMissing;
    }
    if (problems.length) {
      warningCount += problems.length;
      console.warn(`  ⚠ ${file}:`);
      problems.forEach((p) => console.warn(`      - ${p}`));
      // In GitHub Actions, also surface each problem as an annotation on the run.
      if (process.env.GITHUB_ACTIONS) {
        problems.forEach((p) => console.log(`::warning file=meals/data/${file},title=Recipe check::${p}`));
      }
    }
    meals.push(meal);
  }

  meals.sort((a, b) => String(a.title).localeCompare(String(b.title)));

  const bundle = {
    generatedAt: new Date().toISOString(),
    categories: CATEGORIES,
    courses: COURSES,
    meals
  };
  writeFileSync(OUT, JSON.stringify(bundle, null, 2) + "\n", "utf8");

  console.log(`✓ Wrote ${meals.length} meal(s) to ${OUT}`);
  if (warningCount) {
    console.warn(`  ${warningCount} warning(s) above. Recipes with warnings are still published.`);
    if (STRICT) process.exit(1);
  }
}

build();
