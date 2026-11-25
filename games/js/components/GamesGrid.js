/**
 * Empty grid container plus the "N games" count beneath it. LibraryPage
 * fills both with createGameCard() results.
 */
export function GamesGrid() {
  return `
    <div id="games-grid" class="games-grid"></div>
    <footer class="library-footer-count">
      <span id="games-count" class="games-count"></span>
    </footer>
  `;
}
