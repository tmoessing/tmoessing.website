/**
 * Standalone entry point for the game library page.
 *
 * Deliberately self-contained: it does NOT reuse the resume's initApp()
 * (which would force the resume hash routing). It only shares the theme via
 * localStorage['theme'] so dark/light stays in sync across pages.
 */
import { GAMES } from "../data/games.js";
import { LibraryPage } from "./LibraryPage.js";
import { openGameDetails, closeModal, currentDetailsId } from "./components/GameDetailsModal.js";
import { readUrlState, clearGame } from "./urlState.js";
import { mountLibraryShell } from "./components/LibraryShell.js";

function initTheme() {
  const body = document.body;
  const moon = document.querySelector(".moon-icon");
  const sun = document.querySelector(".sun-icon");

  let stored = "light";
  try {
    stored = localStorage.getItem("theme") === "dark" ? "dark" : "light";
  } catch (_) {
    /* storage unavailable: default to light */
  }

  const apply = (theme) => {
    const dark = theme === "dark";
    body.classList.toggle("dark-mode", dark);
    body.classList.toggle("light-mode", !dark);
    // SVG elements have no .hidden property, so set the attribute directly.
    moon.toggleAttribute("hidden", !dark);
    sun.toggleAttribute("hidden", dark);
    try {
      localStorage.setItem("theme", theme);
    } catch (_) {
      /* theme just won't persist */
    }
  };

  apply(stored);
  document
    .getElementById("theme-toggle")
    .addEventListener("click", () => apply(body.classList.contains("dark-mode") ? "light" : "dark"));
}

/** Open (or close) the details modal to match ?game= in the URL. */
function syncGameFromUrl() {
  const { game: id } = readUrlState();
  const game = id && GAMES.find((g) => g.id === id);
  if (game) {
    if (currentDetailsId() !== game.id) openGameDetails(game, { fromHistory: true });
  } else {
    if (id) clearGame(); // unknown id in a shared link: drop it quietly
    closeModal({ fromHistory: true });
  }
}

mountLibraryShell(document.getElementById("app"));
initTheme();
new LibraryPage().init();
syncGameFromUrl();
window.addEventListener("popstate", syncGameFromUrl);
