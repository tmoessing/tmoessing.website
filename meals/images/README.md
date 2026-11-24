# Meal cover images

Drop a cover photo here named after the recipe's file name (its slug):

```
meals/data/chicken-alfredo.md  →  meals/images/chicken-alfredo.jpg
meals/data/tacos.md            →  meals/images/tacos.png
```

The build finds it automatically (`.jpg`, `.jpeg`, `.png`, or `.webp`), so
there's no `image:` line to add. Without a photo, the card and details show a
generated gradient placeholder with the recipe's initials, so photos are
optional and can be added any time.

Keep photos reasonably small (about 1200px on the long side, under ~500 KB):
the card shows them at a few hundred pixels wide, and big files slow the page.
