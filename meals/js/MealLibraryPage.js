/**
 * The /meal-library grid page: loads meals.json once, renders every meal, and
 * wires the toolbar — instant search, sort, shuffle, grid/list view — plus the
 * "Pick a Meal" and "Plan the Week" buttons, plus course chips (Breakfast /
 * Main Course / Dessert) that narrow the grid to one course. Search covers name, description, ingredients,
 * instructions, categories, and tags (the body text is indexed too).
 */
import { createMealCard } from "./MealCard.js";
import { esc, sortMeals } from "./util.js";
import { openPicker } from "./PickerModal.js";
import { openWeekPlanner } from "./WeekPlanner.js";

const VIEW_KEY = "meal-library-view";
const DATA_URL = "../meals/data/meals.json?v=1";

export class MealLibraryPage {
  constructor() {
    this.meals = [];
    this.categories = [];
    this.courses = [];
    this.course = null; // selected course chip, or null for "All"
    this.query = "";
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
    this.renderCourses();
    this.render();
  }

  async load() {
    try {
      const res = await fetch(DATA_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      this.meals = Array.isArray(data.meals) ? data.meals : [];
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
      const what = [this.course, this.query && `“${this.query}”`].filter(Boolean).join(" + ");
      this.grid.innerHTML = `<p class="meals-empty">No meals match ${esc(what)}. Try a different search or course.</p>`;
    } else {
      const frag = document.createDocumentFragment();
      list.forEach((m) => frag.appendChild(createMealCard(m)));
      this.grid.appendChild(frag);
    }

    if (this.countEl) {
      const n = list.length;
      const total = this.meals.length;
      this.countEl.textContent = this.query || this.course
        ? `${n} of ${total} meal${total === 1 ? "" : "s"}`
        : `${total} meal${total === 1 ? "" : "s"}`;
    }
  }
}
