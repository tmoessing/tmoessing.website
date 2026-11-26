# Meal cover images

Drop a cover photo here named after the recipe's file name (its slug):

```
meals/data/main_course/lasagna.md          →  meals/images/lasagna.jpg
meals/data/main_course/tortellini-soup.md  →  meals/images/tortellini-soup.png
```

The build finds it automatically (`.jpg`, `.jpeg`, `.png`, or `.webp`), so
there's no `image:` line to add. Without a photo, the card and details show an
illustration for the recipe's course (pancakes for Breakfast, a dinner plate
for Main Course, a cupcake for Dessert, a salad bowl for Side Dish, popcorn for
Snack) on a background tinted per recipe, so photos are optional and can be
added any time. The illustrations live in `meals/js/placeholders.js`.

Keep photos reasonably small (about 1200px on the long side, under ~500 KB):
the card shows them at a few hundred pixels wide, and big files slow the page.
