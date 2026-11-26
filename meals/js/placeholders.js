/**
 * meals/js/placeholders.js — illustrated cover placeholders, one per course.
 *
 * A recipe with no photo gets a flat illustration for its course (pancakes for
 * Breakfast, a dinner plate for Main Course, a cupcake for Dessert, a salad
 * bowl for Side Dish, popcorn for Snack) on a soft background whose hue comes
 * from the title, so cards in the same course still look different.
 *
 * Course = the first course found in the recipe's categories. Recipes with no
 * course fall back to the Main Course plate.
 */

const COURSE_ART = {
  Breakfast: breakfast,
  "Main Course": mainCourse,
  Dessert: dessert,
  "Side Dish": sideDish,
  Snack: snack,
};

export function courseOf(meal) {
  const cats = (meal && meal.categories) || [];
  return cats.find((c) => COURSE_ART[c]) || "Main Course";
}

function hueOf(text) {
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = text.charCodeAt(i) + ((hash << 5) - hash);
  return Math.abs(hash) % 360;
}

export function illustratedCoverSVG(meal) {
  const title = (meal && meal.title) || "Meal";
  const h = hueOf(title);
  const art = COURSE_ART[courseOf(meal)]();
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">` +
    `<defs>` +
    `<linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="hsl(${h},70%,90%)"/>` +
    `<stop offset="1" stop-color="hsl(${(h + 35) % 360},60%,78%)"/>` +
    `</linearGradient>` +
    `<radialGradient id="glow" cx="0.5" cy="0.55" r="0.5">` +
    `<stop offset="0" stop-color="#fff" stop-opacity="0.55"/>` +
    `<stop offset="1" stop-color="#fff" stop-opacity="0"/>` +
    `</radialGradient>` +
    `</defs>` +
    `<rect width="400" height="400" fill="url(#bg)"/>` +
    dots(h) +
    `<circle cx="200" cy="215" r="190" fill="url(#glow)"/>` +
    `<g transform="translate(200 212) scale(0.7) translate(-200 -212)">` + art + `</g>` +
    `</svg>`
  );
}

/* Scattered confetti dots, positions fixed so every card shares a rhythm. */
function dots(h) {
  const pts = [
    [42, 48, 6], [350, 60, 5], [70, 340, 5], [340, 330, 7], [30, 200, 4],
    [372, 190, 4], [120, 30, 3], [280, 372, 4], [190, 24, 4], [24, 120, 3],
  ];
  return pts
    .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="hsl(${(h + 180) % 360},70%,58%)" opacity="0.45"/>`)
    .join("");
}

const shadow = (cx, cy, rx, ry) =>
  `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="#000" opacity="0.12"/>`;

/* ---------- Breakfast: pancake stack with butter + syrup ---------- */
function breakfast() {
  const cake = (y) =>
    `<rect x="98" y="${y}" width="204" height="34" rx="17" fill="#d9903f"/>` +
    `<rect x="98" y="${y}" width="204" height="16" rx="8" fill="#f2c27b"/>`;
  return (
    shadow(200, 318, 140, 18) +
    `<ellipse cx="200" cy="300" rx="140" ry="26" fill="#fff"/>` +
    `<ellipse cx="200" cy="296" rx="118" ry="18" fill="#eef1f4"/>` +
    cake(256) + cake(222) + cake(188) + cake(154) +
    // syrup pooled on top and dripping down
    `<path d="M108 164 Q200 136 292 164 L292 178 Q286 196 280 178 Q262 186 250 180 L250 214 Q244 230 238 214 L238 182 Q200 190 166 182 L166 200 Q160 214 154 200 L154 180 Q130 178 118 174 L118 190 Q112 202 106 190 Z" fill="#8a3f12" opacity="0.92"/>` +
    `<ellipse cx="200" cy="158" rx="88" ry="12" fill="#a24d16"/>` +
    // butter pat
    `<rect x="176" y="132" width="48" height="26" rx="5" fill="#ffe27a"/>` +
    `<rect x="176" y="132" width="48" height="10" rx="5" fill="#fff3b8"/>` +
    // shine
    `<path d="M130 196 h40" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.5"/>` +
    `<path d="M140 264 h24" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity="0.4"/>`
  );
}

/* ---------- Main Course: plate, fork + knife, protein + veggies ---------- */
function mainCourse() {
  const broccoli = (x, y) =>
    `<rect x="${x - 5}" y="${y}" width="10" height="22" rx="4" fill="#7fb84a"/>` +
    `<circle cx="${x - 12}" cy="${y - 2}" r="13" fill="#3f8f3a"/>` +
    `<circle cx="${x + 12}" cy="${y - 2}" r="13" fill="#3f8f3a"/>` +
    `<circle cx="${x}" cy="${y - 14}" r="15" fill="#4ea444"/>`;
  const carrot = (x, y) =>
    `<circle cx="${x}" cy="${y}" r="13" fill="#f08a24"/>` +
    `<circle cx="${x}" cy="${y}" r="6" fill="#f7b267"/>`;
  return (
    shadow(200, 218, 142, 142) +
    // fork
    `<g fill="#c3ccd6">` +
    `<rect x="30" y="160" width="7" height="44" rx="3"/><rect x="42" y="160" width="7" height="44" rx="3"/><rect x="54" y="160" width="7" height="44" rx="3"/>` +
    `<rect x="30" y="196" width="31" height="16" rx="6"/><rect x="39" y="206" width="13" height="104" rx="6"/>` +
    `</g>` +
    // knife
    `<g fill="#c3ccd6">` +
    `<path d="M352 150 Q376 180 368 236 L352 236 Z"/><rect x="350" y="232" width="16" height="84" rx="7"/>` +
    `</g>` +
    // plate
    `<circle cx="200" cy="210" r="138" fill="#fff"/>` +
    `<circle cx="200" cy="210" r="108" fill="#f1f4f7"/>` +
    `<circle cx="200" cy="210" r="108" fill="none" stroke="#e1e6eb" stroke-width="3"/>` +
    // protein (roast / chicken breast)
    `<path d="M128 214 Q122 168 172 160 Q226 152 236 192 Q244 236 196 246 Q140 254 128 214 Z" fill="#b8622e"/>` +
    `<path d="M140 206 Q140 176 174 170 Q214 164 222 194" fill="none" stroke="#d98a4e" stroke-width="7" stroke-linecap="round"/>` +
    `<path d="M150 222 l60 -26 M156 236 l58 -24" stroke="#8f4520" stroke-width="5" stroke-linecap="round" opacity="0.6"/>` +
    // veggies
    broccoli(262, 182) + broccoli(240, 236) +
    carrot(196, 280) + carrot(226, 290) + carrot(166, 276) +
    // herb sprinkle
    `<g fill="#3f8f3a"><circle cx="170" cy="190" r="3"/><circle cx="196" cy="182" r="3"/><circle cx="186" cy="214" r="3"/><circle cx="210" cy="204" r="3"/></g>`
  );
}

/* ---------- Dessert: frosted cupcake with cherry + sprinkles ---------- */
function dessert() {
  const sprinkles = [
    [168, 168, 20, "#ff5d8f"], [214, 150, -30, "#4cc9f0"], [244, 186, 40, "#ffd166"],
    [150, 204, -20, "#06d6a0"], [196, 196, 70, "#ffd166"], [232, 222, -50, "#ff5d8f"],
    [180, 132, 10, "#06d6a0"], [266, 214, 15, "#4cc9f0"], [134, 236, 60, "#ff5d8f"],
  ]
    .map(([x, y, r, c]) => `<rect x="${x}" y="${y}" width="16" height="6" rx="3" fill="${c}" transform="rotate(${r} ${x + 8} ${y + 3})"/>`)
    .join("");
  return (
    shadow(200, 342, 100, 14) +
    // liner
    `<path d="M112 244 L288 244 L264 340 L136 340 Z" fill="#ff7aa2"/>` +
    `<g stroke="#e0507e" stroke-width="5">` +
    `<line x1="146" y1="246" x2="158" y2="338"/><line x1="178" y1="246" x2="184" y2="338"/>` +
    `<line x1="210" y1="246" x2="210" y2="338"/><line x1="242" y1="246" x2="236" y2="338"/>` +
    `<line x1="272" y1="246" x2="262" y2="338"/>` +
    `</g>` +
    // frosting swirl
    `<path d="M100 248 Q92 210 128 204 Q116 168 158 160 Q160 120 200 116 Q240 120 242 160 Q284 168 272 204 Q308 210 300 248 Z" fill="#fff1f6"/>` +
    `<path d="M112 238 Q200 222 288 238" fill="none" stroke="#f7c9da" stroke-width="6" stroke-linecap="round"/>` +
    `<path d="M136 200 Q200 184 264 200" fill="none" stroke="#f7c9da" stroke-width="6" stroke-linecap="round"/>` +
    `<path d="M164 158 Q200 146 236 158" fill="none" stroke="#f7c9da" stroke-width="6" stroke-linecap="round"/>` +
    sprinkles +
    // cherry
    `<path d="M204 100 Q212 70 236 62" fill="none" stroke="#5a8f2e" stroke-width="5" stroke-linecap="round"/>` +
    `<circle cx="200" cy="108" r="22" fill="#d7263d"/>` +
    `<circle cx="192" cy="100" r="6" fill="#fff" opacity="0.6"/>`
  );
}

/* ---------- Side Dish: salad bowl ---------- */
function sideDish() {
  const leaf = (x, y, rot, c) =>
    `<path d="M0 0 Q26 -30 56 0 Q26 22 0 0 Z" fill="${c}" transform="translate(${x} ${y}) rotate(${rot})"/>`;
  return (
    shadow(200, 330, 130, 16) +
    // greens poking above the rim
    leaf(96, 196, -30, "#5fae46") + leaf(140, 170, -60, "#7cc95b") +
    leaf(200, 150, -95, "#4e9a3a") + leaf(236, 168, -130, "#7cc95b") +
    leaf(290, 196, -160, "#5fae46") + leaf(170, 186, -10, "#9ad66f") +
    leaf(214, 196, -170, "#4e9a3a") +
    // tomatoes, cucumber, onion
    `<circle cx="150" cy="200" r="18" fill="#e63946"/><circle cx="144" cy="194" r="5" fill="#fff" opacity="0.5"/>` +
    `<circle cx="262" cy="196" r="16" fill="#e63946"/><circle cx="256" cy="190" r="4" fill="#fff" opacity="0.5"/>` +
    `<circle cx="206" cy="186" r="15" fill="#e63946"/>` +
    `<circle cx="182" cy="210" r="14" fill="#cfe8b5" stroke="#3f7d2c" stroke-width="4"/>` +
    `<circle cx="234" cy="212" r="14" fill="#cfe8b5" stroke="#3f7d2c" stroke-width="4"/>` +
    `<path d="M112 214 Q126 196 142 214" fill="none" stroke="#b5179e" stroke-width="5" stroke-linecap="round"/>` +
    `<path d="M270 216 Q284 200 298 216" fill="none" stroke="#b5179e" stroke-width="5" stroke-linecap="round"/>` +
    // bowl
    `<path d="M70 214 L330 214 Q326 312 200 322 Q74 312 70 214 Z" fill="#2a9d8f"/>` +
    `<path d="M70 214 L330 214 Q329 236 324 252 L76 252 Q71 236 70 214 Z" fill="#33b3a3"/>` +
    `<rect x="64" y="206" width="272" height="16" rx="8" fill="#5cc8b8"/>` +
    `<path d="M104 270 Q120 296 150 306" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" opacity="0.35"/>`
  );
}

/* ---------- Snack: striped popcorn box ---------- */
function snack() {
  const kernel = (x, y, r) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="#fff8e1"/>` +
    `<circle cx="${x + r * 0.35}" cy="${y + r * 0.3}" r="${r * 0.45}" fill="#ffe08a"/>`;
  const kernels = [
    [140, 150, 22], [176, 124, 24], [214, 118, 25], [252, 130, 23], [272, 160, 20],
    [124, 180, 18], [160, 162, 22], [200, 150, 24], [238, 160, 22], [280, 186, 16],
    [190, 96, 18], [232, 92, 16], [104, 112, 12], [306, 120, 11],
  ]
    .map(([x, y, r]) => kernel(x, y, r))
    .join("");
  return (
    shadow(200, 342, 96, 14) +
    kernels +
    `<path d="M116 180 L284 180 L262 340 L138 340 Z" fill="#fff"/>` +
    `<clipPath id="box"><path d="M116 180 L284 180 L262 340 L138 340 Z"/></clipPath>` +
    `<g clip-path="url(#box)" fill="#e63946">` +
    `<rect x="116" y="170" width="28" height="180" transform="skewX(-6)"/>` +
    `<rect x="172" y="170" width="28" height="180"/>` +
    `<rect x="228" y="170" width="28" height="180" transform="skewX(6)"/>` +
    `</g>` +
    `<rect x="108" y="174" width="184" height="18" rx="6" fill="#c1121f"/>` +
    `<circle cx="200" cy="262" r="30" fill="#ffd166"/>` +
    `<text x="200" y="263" font-family="Segoe UI, system-ui, sans-serif" font-size="26" font-weight="800" fill="#c1121f" text-anchor="middle" dominant-baseline="central">★</text>`
  );
}
