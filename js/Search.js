/**
 * Search module for handling search functionality, tag generation, and AI logic.
 */
export class Search {
    constructor(parser, renderer) {
        this.parser = parser;
        this.renderer = renderer;
        this.searchableItems = [];
        this.allTags = new Set();
    }

    /**
     * Collects all relevant items into a single searchable array and gathers unique tags.
     */
    collectSearchableItems(content) {
        this.searchableItems = [];
        this.allTags = new Set();
        
        const addItems = (section, category) => {
            const items = content[section];
            if (Array.isArray(items)) {
                items.forEach(item => {
                    this.searchableItems.push({ 
                        ...item, 
                        category: category,
                        section: section
                    });
                    if (item.tags) {
                        item.tags.split(this.parser.TAG_SPLIT_REGEX).forEach(t => this.allTags.add(t.trim()));
                    }
                });
            } else if (typeof items === 'object') {
                Object.entries(items).forEach(([title, details]) => {
                    if (title === 'mainText' || typeof details !== 'object') return;
                    this.searchableItems.push({ 
                        ...details, 
                        title: title,
                        category: category, section: section
                    });
                    if (details.tags) {
                        details.tags.split(this.parser.TAG_SPLIT_REGEX).forEach(t => this.allTags.add(t.trim()));
                    }
                });
            }
        };

        // Professional tab only: Picks & Plugs ('resources') and Personal Projects stay out of search.
        addItems('experience', 'job');
        addItems('projects', 'project');
        addItems('publications', 'publication');
        addItems('service', 'service');
        addItems('volunteer', 'volunteer');
        addItems('interests', 'leadership');
        addItems('education', 'education');
        
        this.allTags = new Set(Array.from(this.allTags).sort());
    }

    /**
     * Performs a search across all items by text, or by exact tag when exactTag is set
     * (tag clicks and ?tag= links), so "DEV" doesn't also match "developed".
     */
    performSearch(query, { exactTag = false } = {}) {
        const queryEl = document.querySelector('#search-query-display');
        const countEl = document.querySelector('#search-count');

        this.renderTagRow();
        this.markActiveTag(exactTag ? query : '');

        if (!query || query.trim().length === 0) {
            if (queryEl) queryEl.textContent = '...';
            if (countEl) countEl.textContent = '0';
            this.renderSuggestedTags();
            return;
        }

        this.renderSearchResults(this.findMatches(query, exactTag), query);
    }

    /**
     * Returns the items matching a query (tags, title, description or company).
     * Shared by searches and the tag-cloud counts so the numbers always agree.
     */
    findMatches(query, exactTag = false) {
        const normalizedQuery = query.toLowerCase().trim();
        if (exactTag) {
            return this.searchableItems.filter(item => (item.tags || '')
                .split(this.parser.TAG_SPLIT_REGEX)
                .some(t => t.trim().toLowerCase() === normalizedQuery));
        }
        return this.searchableItems.filter(item => {
            const tags = (item.tags || '').toLowerCase();
            const title = (item.title || item.degree || '').toLowerCase();
            const description = (item.description || '').toLowerCase();
            const company = (item.company || item.institution || '').toLowerCase();

            return tags.includes(normalizedQuery) || 
                   title.includes(normalizedQuery) || 
                   description.includes(normalizedQuery) || 
                   company.includes(normalizedQuery);
        });
    }

    /**
     * Empty search: make sure the tag row is there and show a hint in place of results.
     */
    renderSuggestedTags() {
        this.renderTagRow();
        this.markActiveTag('');
        const container = document.querySelector('#search-results-container');
        if (container) container.innerHTML = '<p class="search-empty-hint">Pick a tag above or start typing to search.</p>';
    }

    /**
     * Renders the row of top tags under the search input (once content has loaded).
     * Only tags with 2+ results are shown, most results first, each with its result count.
     */
    renderTagRow() {
        const row = document.querySelector('#search-tag-row');
        if (!row || row.dataset.rendered) return;

        const tags = Array.from(this.allTags)
            .map(tag => ({ tag, count: this.findMatches(tag, true).length }))
            .filter(({ count }) => count >= 2)
            .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
        if (tags.length === 0) return;
        const hues = this.renderer.tagHues(tags.map(({ tag }) => tag));

        row.innerHTML = `<span class="search-tag-row-label">Top tags</span>` + tags.map(({ tag, count }, i) => `<a href="#/professional/search?tag=${encodeURIComponent(tag)}" class="skill-tag tag-chip search-tag" data-tag="${tag.toLowerCase()}" style="${this.renderer.tagChipStyle(hues[i])}" title="${count} results for ${tag}" onclick="event.preventDefault(); document.querySelector('#search-input').value = '${tag}'; window.location.hash = '/professional/search?tag=${encodeURIComponent(tag)}'; window.contentLoader.performSearch('${tag}', { exactTag: true });">${tag.toUpperCase()}<span class="tag-count" aria-label="${count} results">${count}</span></a>`).join('');
        row.dataset.rendered = 'true';
    }

    /** Fills in the tag chip that matches the current tag search, if any. */
    markActiveTag(tag) {
        const active = (tag || '').toLowerCase().trim();
        document.querySelectorAll('#search-tag-row .search-tag').forEach(chip => {
            chip.classList.toggle('is-active', chip.dataset.tag === active);
        });
    }

    /**
     * Renders search results into the search container.
     */
    renderSearchResults(results, query) {
        const container = document.querySelector('#search-results-container');
        const countEl = document.querySelector('#search-count');
        const queryEl = document.querySelector('#search-query-display');
        
        if (!container) return;

        if (queryEl) queryEl.textContent = query;
        if (countEl) countEl.textContent = results.length;

        container.innerHTML = '';
        if (results.length === 0) {
            container.innerHTML = '<p class="no-results" style="padding: 3rem; text-align: center; color: var(--text-muted);">No items found matching your search.</p>';
            return;
        }

        results.forEach(item => {
            let card;
            if (item.section === 'education') {
                card = this.renderer.createEducationCard(item);
            } else if (item.section === 'projects' || item.section === 'personal projects') {
                card = this.renderer.createProjectCard(item);
            } else if (item.section === 'publications') {
                card = this.renderer.createPublicationCard(item);
            } else if (item.section === 'resources') {
                card = this.renderer.createResourceCard(item, 'Resource');
            } else {
                card = this.renderer.createExperienceCard(item);
            }
            container.appendChild(card);
        });
    }

    /**
     * Handles AI queries and provides responses based on the loaded content.
     */
    askAI(query) {
        if (!query || query.trim().length === 0) return;

        const chatContainer = document.querySelector('#ai-chat-messages');
        const input = document.querySelector('#ai-input');
        if (!chatContainer || !input) return;

        input.value = '';

        const userMsg = document.createElement('div');
        userMsg.className = 'chat-message user-message';
        userMsg.textContent = query;
        chatContainer.appendChild(userMsg);

        chatContainer.scrollTop = chatContainer.scrollHeight;

        setTimeout(() => {
            const aiMsg = document.createElement('div');
            aiMsg.className = 'chat-message ai-message';
            
            const response = this.generateAIResponse(query);
            aiMsg.innerHTML = response;
            chatContainer.appendChild(aiMsg);
            chatContainer.scrollTop = chatContainer.scrollHeight;
        }, 600);
    }

    /**
     * Generates a simple keyword-based response from content data.
     */
    generateAIResponse(query) {
        const q = query.toLowerCase();
        
        const results = this.searchableItems.filter(item => {
            const tags = (item.tags || '').toLowerCase();
            const title = (item.title || item.degree || '').toLowerCase();
            const description = (item.description || '').toLowerCase();
            return tags.includes(q) || title.includes(q) || description.includes(q);
        });

        if (q.includes('skill') || q.includes('technology') || q.includes('tools')) {
            return `Tyler has a wide range of skills. His top technologies include: <strong>${Array.from(this.allTags).slice(0, 10).join(', ')}</strong>, and many others you can find in the Skills section.`;
        }

        if (results.length > 0) {
            const topResult = results[0];
            const title = topResult.title || topResult.degree;
            const company = topResult.company || topResult.institution || '';
            const desc = topResult.description || '';
            
            let resp = `I found some relevant information in Tyler's history: <br><br><strong>${title}</strong> ${company ? `at ${company}` : ''}<br>${desc.substring(0, 200)}${desc.length > 200 ? '...' : ''}`;
            
            if (results.length > 1) {
                resp += `<br><br>He also has ${results.length - 1} other related experience(s). You might want to check the Search Mode for "${query}" to see all of them!`;
            }
            return resp;
        }

        if (q.includes('hello') || q.includes('hi ')) {
            return "Hi there! I can help you find specific details about Tyler's background. Try asking about his Python experience or his machine learning projects.";
        }

        return "I'm not quite sure about that specific question, but I can tell you that Tyler is a Computer Science student at BYU with a 3.98 GPA and strong interests in Machine Learning and Statistics. Would you like to see his projects or work experience?";
    }
}
