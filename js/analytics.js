/**
 * Analytics: privacy-friendly page views and click events via GoatCounter
 * (https://www.goatcounter.com). No cookies, no user input, no PII.
 *
 * Page views: the site uses hash routes (#/professional, #/personal/...), which
 * GoatCounter can't see on its own. So its auto-count is off (no_onload) and we
 * count `pathname + hash` once on load and on every hashchange. Query strings in
 * the hash (e.g. search terms in #/professional/search?q=...) are stripped so
 * nothing a visitor types is ever sent, and a path identical to the last one
 * counted is skipped so a navigation is never counted twice.
 *
 * Click events: any element with data-gc-event="<name>" is counted as an event
 * when clicked (delegated, so cards rendered later from Markdown work too).
 * Call trackEvent(name) for anything that isn't a click on such an element.
 */

// Your GoatCounter site code (the "<code>" in https://<code>.goatcounter.com).
// Analytics stays off until this is changed from the placeholder.
const GOATCOUNTER_CODE = 'YOURCODE';

// GoatCounter ignores localhost / private IPs by default. Set to true to test locally.
const ALLOW_LOCAL = false;

const ENABLED = GOATCOUNTER_CODE && GOATCOUNTER_CODE !== 'YOURCODE';
const RETRY_MS = 100;
const MAX_RETRIES = 50; // give up after ~5s (blocked by an ad blocker, offline, ...)

let lastPath = null;

function loadScript() {
    const settings = { no_onload: true };
    if (ALLOW_LOCAL) settings.allow_local = true;

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://gc.zgo.at/count.js';
    script.dataset.goatcounter = `https://${GOATCOUNTER_CODE}.goatcounter.com/count`;
    script.dataset.goatcounterSettings = JSON.stringify(settings);
    document.head.appendChild(script);
}

// Send now if count.js is ready, otherwise retry briefly.
function send(vars, attempt = 0) {
    if (typeof window.goatcounter?.count === 'function') {
        window.goatcounter.count(vars);
    } else if (attempt < MAX_RETRIES) {
        setTimeout(() => send(vars, attempt + 1), RETRY_MS);
    }
}

function currentPath() {
    const hash = location.hash.split('?')[0];
    return location.pathname + (hash === '#' ? '' : hash);
}

function trackPageView() {
    const path = currentPath();
    if (path === lastPath) return;
    lastPath = path;
    send({ path });
}

export function trackEvent(name, title = name) {
    if (!ENABLED) return;
    send({ path: name, title, event: true });
}

function onClick(e) {
    // Left click, or middle click (auxclick) opening a link in a new tab.
    if (e.type === 'auxclick' && e.button !== 1) return;
    const el = e.target.closest?.('[data-gc-event]');
    if (!el) return;
    const label = (el.dataset.gcTitle || el.getAttribute('title') || el.textContent || '').replace(/\s+/g, ' ').trim();
    trackEvent(el.dataset.gcEvent, label.slice(0, 100) || el.dataset.gcEvent);
}

/**
 * Call once after the router has set the initial hash (initApp), so the first
 * view is counted with its final path rather than as "/".
 */
export function initAnalytics() {
    if (!ENABLED) return;
    loadScript();
    trackPageView();
    window.addEventListener('hashchange', trackPageView);
    // Capture phase so clicks are seen even if a handler stops propagation.
    document.addEventListener('click', onClick, true);
    document.addEventListener('auxclick', onClick, true);
}
