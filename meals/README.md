# Meal Library

Every recipe is one Markdown file in `meals/data/`. The page at
`/meal-library/` reads `meals/data/meals.json`, which is generated from those
files automatically on every deploy.

## Add a recipe

1. **Copy** `meals/TEMPLATE.md` to `meals/data/<recipe-name>.md`.
   - Use lowercase-with-dashes: `honey-garlic-salmon.md`.
   - The file name becomes the recipe's link (`/meal-library/#honey-garlic-salmon`),
     so don't rename it later or old links break.
2. **Fill it in.** The top block (between the `---` lines) holds the details;
   below it, write the recipe in plain Markdown under `## Ingredients` and
   `## Instructions` (plus optional `## Notes`, `## Tips`, `## Variations`).
3. **Optional photo:** add `meals/images/<recipe-name>.jpg` (or `.png`/`.webp`).
   It's picked up automatically. No photo? A colored placeholder is shown.
4. **Commit to `main`.** The deploy rebuilds `meals.json` and publishes. That's it.

You can do all of this from the GitHub website or app. No local setup needed.

## Required fields

| Field | Example | Notes |
|---|---|---|
| `title` | `Honey Garlic Salmon` | |
| `description` | `Sticky, sweet salmon in 25 minutes.` | One sentence for the card |
| `prepTime` | `10` | Minutes, number only |
| `cookTime` | `15` | Minutes; `0` for no-cook |
| `servings` | `4` | |

Everything else (`estimatedCost`, `categories`, `tags`, `recipeSource`,
`walmartList`, `prepDuration`, `nutrition`) is optional; `TEMPLATE.md`
explains each one. Don't add `totalTime` or `image`; the build fills those in.

## Categories

Categories power the filters, so they must come from this list (the build
warns about typos and suggests the right spelling):

- **Meals:** Breakfast, Main Course, Side Dish, Snack, Dessert
- **Diet:** High Protein, Low Carb, Vegetarian, Vegan, Gluten Free, Healthy
- **Protein:** Chicken, Beef, Pork, Seafood
- **Base:** Pasta, Rice
- **Cuisine:** Mexican, Italian, Asian, American
- **Method:** Slow Cooker, Air Fryer, Grill
- **Style:** Comfort Food, Meal Prep, Budget Friendly, Quick Meals

**Courses:** Breakfast, Main Course, and Dessert also show up as quick-filter
chips at the top of the library, so give every recipe one of those three (or
Side Dish / Snack). Lunch and Dinner were merged into Main Course; the build points out any
leftovers. The chip list lives in `COURSES` in `meals/build.mjs`.

To add a new category, add it to `CATEGORIES` in `meals/build.mjs` (and to the
lists in this file and `TEMPLATE.md`). `tags` are free-form, so use those for
anything that doesn't need a filter.

## Checking your work

Every deploy runs the build and lists any problems as warnings on the GitHub
Actions run (missing fields, misspelled field names like `prepTme`, unknown
categories, missing sections). A recipe with warnings still publishes, so a
typo never takes the site down.

To check before committing (needs Node.js):

```sh
node meals/build.mjs           # rebuild meals.json and show warnings
node meals/build.mjs --strict  # same, but exit with an error if anything's off
```

## Drafts

Start a file name with `_` (e.g. `_lasagna.md`) to keep it out of the library
while you work on it. Rename it to drop the `_` when it's ready.

## Formatting gotchas

- In the top block, ` #` starts a comment. If a value needs a `#`, wrap it in
  quotes: `description: "Uses #2 grade maple syrup"`.
- Times, servings, and cost are plain numbers: `15`, not `15 min` or `$15`.
- Indent list items (categories, tags) and nutrition lines with two spaces.
