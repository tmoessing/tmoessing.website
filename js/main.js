import { ContentLoader } from './ContentLoader.js';
import { initApp } from './app.js';
import { initAnalytics } from './analytics.js';

// On mobile the sidebar becomes a sticky header whose height depends on its text.
// Keep --mobile-header-height in sync so sticky section titles sit right under it.
function syncMobileHeaderHeight() {
    const header = document.querySelector('.sidebar');
    if (!header || typeof ResizeObserver === 'undefined') return;
    const mobile = window.matchMedia('(max-width: 1024px)');
    const update = () => {
        if (!mobile.matches || header.classList.contains('mobile-menu-open')) return;
        document.documentElement.style.setProperty('--mobile-header-height', `${Math.ceil(header.offsetHeight)}px`);
    };
    new ResizeObserver(update).observe(header);
    mobile.addEventListener('change', update);
}

document.addEventListener('DOMContentLoaded', () => {
    syncMobileHeaderHeight();
    // Initialize UI state and events
    initApp();
    // After initApp so the initial hash (#/professional) is set before the first page view.
    initAnalytics();

    // Initialize Content Loading
    window.contentLoader = new ContentLoader();
    window.contentLoader.load();
});
