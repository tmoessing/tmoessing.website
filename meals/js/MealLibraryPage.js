/**
 * The /meal-library grid page: loads meals.json once, renders every meal, and
 * wires the toolbar — instant search, sort, shuffle, grid/list view — plus the
 * "Pick a Meal" and "Plan the Week" buttons, plus course chips (Breakfast /
 * Main Course / Dessert) that narrow the grid to one course. Search covers name, description, ingredients,
 * instructions, categories, and tags (the body text is indexed too).
 *
 * Recipes marked `hidden: true` are left out entirely (grid, picker, planner,
 * deep links) unless the page is opened with ?hidden, e.g.
 * /meal-library/?hidden — then they show up with a "Hidden" badge.
 */
import { createMealCard } from "./MealCard.js";
import { esc, sortMeals } from "./util.js";
import { openPicker } from "./PickerModal.js";
import { openWeekPlanner } from "./WeekPlanner.js";

const VIEW_KEY = "meal-library-view";
const DATA_URL = "../meals/data/meals.json?v=1";
const GRANDMA_TAG = "Grandma";
const TRY_TAG = "Want to Try";
const SHOW_HIDDEN =new URLSearchParams(location.search).has("hidden");

export class MealLibraryPage {
  constructor() {
    this.meals = [];
    this.categories = [];
    this.courses = [];
    this.course = null; // selected course chip, or null for "All"
    this.query = "";
    this.onlyGrandma = false; // "Only Grandma's" toggle
    this.hideTry = false; // "Hide Want to Try" toggle
    this.sortKey = "alpha";
    this.view = localStorage.getItem(VIEW_KEY) === "list" ? "list" : "grid";
    this.bySlug = {};
  }

  async init() {
    this.grid = document.getElementById("meals-grid");
    this.countEl = document.getElementById("meals-count");
    this.searchInput = document.getElementById("meal-search");
    this.sortSel = document.getElementById("meal-sort");
    this.gridBtn = document.getElementById("view-grid");
    this.listBtn = document.getElementById("view-list");
    this.courseEl = document.getElementById("course-filter");
    this.togglesEl = document.getElementById("tag-toggles");

    if (this.gridBtn) this.gridBtn.addEventListener("click", () => this.setView("grid"));
    if (this.listBtn) this.listBtn.addEventListener("click", () => this.setView("list"));
    this.applyView();

    const pickBtn = document.getElementById("pick-a-meal-btn");
    if (pickBtn) pickBtn.addEventListener("click", () => openPicker(this.meals, this.categories));

    const planBtn = document.getElementById("plan-week-btn");
    if (planBtn) planBtn.addEventListener("click", () => openWeekPlanner(this.meals));

    const shuffleBtn = document.getElementById("meal-shuffle");
    if (shuffleBtn) {
      shuffleBtn.addEventListener("click", () => {
        this.sortKey = "random";
        if (this.sortSel) this.sortSel.value = "alpha";
        this.render();
      });
    }

    if (this.sortSel) {
      this.sortSel.addEventListener("change", () => {
        this.sortKey = this.sortSel.value;
        this.render();
      });
    }

    if (this.searchInput) {
      this.searchInput.addEventListener("input", () => {
        this.query = this.searchInput.value.trim().toLowerCase();
        this.render();
      });
    }

    await this.load();
    this.renderToggles();
    this.renderCourses();
    this.render();
  }

  async load() {
    try {
      const res = await fetch(DATA_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const all = Array.isArray(data.meals) ? data.meals : [];
      this.meals = SHOW_HIDDEN ? all : all.filter((m) => m.hidden !== true);
      this.categories = Array.isArray(data.categories) ? data.categories : [];
      this.courses = Array.isArray(data.courses) ? data.courses : [];
    } catch (err) {
      console.error("Failed to load meals.json", err);
      this.meals = [];
      if (this.grid) {
        this.grid.innerHTML = `<p class="meals-error">Couldn't load the meal library. Make sure <code>meals/data/meals.json</code> exists (run <code>node meals/build.mjs</code>).</p>`;
      }
    }

    // Build a lowercased search index + slug lookup once.
    this.bySlug = {};
    this.meals.forEach((m) => {
      this.bySlug[m.slug] = m;
      m._search = [
        m.title,
        m.description,
        (m.categories || []).join(" "),
        (m.tags || []).join(" "),
        m.body
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
    });
  }

  /** Meal lookup by slug — used by meals-main.js for hash deep-links. */
  getBySlug() {
    return this.bySlug;
  }

  /**
   * On/off chips under the search bar: "Only Grandma's" (recipes tagged
   * Grandma) and "Hide Want to Try" (drops recipes tagged Want to Try). Each
   * chip only appears when some loaded recipe has that tag.
   */
  renderToggles() {
    if (!this.togglesEl) return;
    const hasTag = (tag) => this.meals.filter((m) => (m.tags || []).includes(tag)).length;
    const toggles = [
      { key: "onlyGrandma", label: "Only Grandma's", count: hasTag(GRANDMA_TAG) },
      { key: "hideTry", label: "Hide Want to Try", count: hasTag(TRY_TAG) }
    ].filter((t) => t.count > 0);

    this.togglesEl.innerHTML = "";
    this.togglesEl.hidden = toggles.length === 0;
    toggles.forEach((t) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "course-chip";
      btn.innerHTML = `${esc(t.label)} <span class="course-count">${t.count}</span>`;
      const sync = () => {
        btn.classList.toggle("active", this[t.key]);
        btn.setAttribute("aria-pressed", String(this[t.key]));
      };
      btn.addEventListener("click", () => {
        this[t.key] = !this[t.key];
        sync();
        this.render();
      });
      sync();
      this.togglesEl.appendChild(btn);
    });
  }

  /** Course chips: "All" plus one per course, each with its recipe count. */
  renderCourses() {
    if (!this.courseEl) return;
    if (!this.courses.length) {
      this.courseEl.hidden = true;
      return;
    }
    const chip = (label, value, count) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "course-chip";
      btn.dataset.course = value ?? "";
      btn.innerHTML = `${label} <span class="course-count">${count}</span>`;
      btn.addEventListener("click", () => {
        this.course = this.course === value ? null : value;
        this.updateCourseChips();
        this.render();
      });
      return btn;
    };
    this.courseEl.innerHTML = "";
    this.courseEl.appendChild(chip("All", null, this.meals.length));
    this.courses.forEach((c) => {
      const n = this.meals.filter((m) => (m.categories || []).includes(c)).length;
      this.courseEl.appendChild(chip(c, c, n));
    });
    this.updateCourseChips();
  }

  updateCourseChips() {
    if (!this.courseEl) return;
    this.courseEl.querySelectorAll(".course-chip").forEach((btn) => {
      const on = (btn.dataset.course || null) === this.course;
      btn.classList.toggle("active", on);
      btn.setAttribute("aria-pressed", String(on));
    });
  }

  visibleMeals() {
    let list = this.meals;
    if (this.onlyGrandma) list = list.filter((m) => (m.tags || []).includes(GRANDMA_TAG));
    if (this.hideTry) list = list.filter((m) => !(m.tags || []).includes(TRY_TAG));
    if (this.course) {
      list = list.filter((m) => (m.categories || []).includes(this.course));
    }
    if (this.query) {
      const terms = this.query.split(/\s+/).filter(Boolean);
      list = list.filter((m) => terms.every((t) => m._search.includes(t)));
    }
    return sortMeals(list, this.sortKey);
  }

  setView(view) {
    if (this.view === view) return;
    this.view = view;
    localStorage.setItem(VIEW_KEY, view);
    this.applyView();
  }

  applyView() {
    const isList = this.view === "list";
    if (this.grid) this.grid.classList.toggle("list-view", isList);
    if (this.gridBtn) {
      this.gridBtn.classList.toggle("active", !isList);
      this.gridBtn.setAttribute("aria-pressed", String(!isList));
    }
    if (this.listBtn) {
      this.listBtn.classList.toggle("active", isList);
      this.listBtn.setAttribute("aria-pressed", String(isList));
    }
  }

  render() {
    if (!this.grid) return;
    const list = this.visibleMeals();
    this.grid.innerHTML = "";

    if (list.length === 0 && this.meals.length > 0) {
      const what = [this.onlyGrandma && "Grandma's", this.course, this.query && `“${this.query}”`].filter(Boolean).join(" + ");
      this.grid.innerHTML = `<p class="meals-empty">No meals match ${esc(what || "these filters")}. Try a different search or filter.</p>`;
    } else {
      const frag = document.createDocumentFragment();
      list.forEach((m) => frag.appendChild(createMealCard(m)));
      this.grid.appendChild(frag);
    }

    if (this.countEl) {
      const n = list.length;
      const total = this.meals.length;
      this.countEl.textContent = n !== total
        ? `${n} of ${total} meal${total === 1 ? "" : "s"}`
        : `${total} meal${total === 1 ? "" : "s"}`;
    }
  }
}
