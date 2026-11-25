---
# ─── COPY THIS FILE to meals/data/<your-recipe-name>.md ───────────────────
# File name: lowercase-with-dashes.md (e.g. honey-garlic-salmon.md).
# It becomes the recipe's link, so pick it once and don't rename it.
# Delete any line you don't need. Lines starting with # are ignored.

title: Honey Garlic Salmon                 # required
description: One short sentence for the card.   # required
prepTime: 10        # required, minutes (a plain number, no "min")
cookTime: 15        # required, minutes; use 0 for no-cook
servings: 4         # required
estimatedCost: 15   # dollars for the whole recipe, number only

# Pick from this list (spelling matters; the build warns about typos):
#   Meals:    Breakfast, Main Course, Snack, Dessert
#   Diet:     High Protein, Low Carb, Vegetarian, Vegan, Gluten Free, Healthy
#   Protein:  Chicken, Beef, Pork, Seafood
#   Base:     Pasta, Rice
#   Cuisine:  Mexican, Italian, Asian, American
#   Method:   Slow Cooker, Air Fryer, Grill
#   Style:    Comfort Food, Meal Prep, Budget Friendly, Quick Meals
categories:
  - Main Course
  - Seafood

# Free-form labels, anything you like (e.g. Freezer Friendly, Family Favorite).
tags:
  - Weeknight

# Optional links. Leave blank to hide the button.
recipeSource:       # where the recipe came from (URL)
walmartList:        # a Walmart grocery-list URL

# Optional: how long to block off for meal prep in the "Add to calendar"
# button, in minutes. Defaults to prepTime + cookTime.
prepDuration:

# Optional: any nutrition facts, per serving. Add or remove lines freely.
nutrition:
  calories: 450
  protein: 35g

# You do NOT need these; the build fills them in for you:
#   totalTime  = prepTime + cookTime
#   image      = meals/images/<file-name>.jpg (or .png/.webp) if you add one
---

## Ingredients
- 4 salmon fillets
- 3 tbsp honey
- 3 cloves garlic, minced

## Instructions
1. First step.
2. Second step.
3. Third step.

## Notes
Optional. Anything worth knowing: substitutions, why it works, where it came from.

## Tips
- Optional. Storage, make-ahead, or serving tips.

## Variations
- Optional. Ways to change it up.
