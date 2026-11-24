/**
 * Renderer module for creating and injecting DOM elements.
 */
export class Renderer {
    constructor(parser) {
        this.parser = parser;
    }

    /**
     * Helper to set text content of an element.
     */
    setTextContent(sel, txt) { 
        const el = document.querySelector(sel); 
        if (el) el.textContent = txt; 
    }

    /**
     * Helper to set HTML content of an element.
     */
    setHTML(sel, html) { 
        const el = document.querySelector(sel); 
        if (el) el.innerHTML = html; 
    }

    /**
     * Helper to set attribute of an element.
     */
    setAttr(sel, attr, val) { 
        const el = document.querySelector(sel); 
        if (el) el.setAttribute(attr, val); 
    }

    renderProfile(profile) {
        if (!profile) return;
        this.setTextContent('.profile-name', profile.name);
        const toTitleHTML = (title) => (title || '').split('|').map(part => `<span>${part.trim()}</span>`).join(' ');
        const isPersonal = window.location.hash.startsWith('#/personal');

        // Store both titles and photos so app.js can swap them when the view changes.
        const title = document.querySelector('.profile-title');
        if (title) {
            title.dataset.professionalTitle = toTitleHTML(profile.professional_title);
            title.dataset.personalTitle = toTitleHTML(profile.personal_title || profile.professional_title);
            title.innerHTML = isPersonal ? title.dataset.personalTitle : title.dataset.professionalTitle;
        }

        const photo = document.querySelector('.profile-photo');
        if (photo) {
            photo.dataset.professionalPhoto = profile.professional_photo || '';
            photo.dataset.personalPhoto = profile.personal_photo || profile.professional_photo || '';
            photo.src = isPersonal ? photo.dataset.personalPhoto : photo.dataset.professionalPhoto;
        }
    }

    renderContact(contact) {
        if (!contact) return;

        const socialLinks = {
            email: contact.email ? `mailto:${contact.email}` : null,
            linkedin: contact.linkedin,
            github: contact.github,
            kaggle: contact.kaggle,
            leetcode: contact.leetcode,
            facebook: contact.facebook,
            threads: contact.threads,
            venmo: contact.venmo,
            orcid: contact.orcid,
            kattis: contact.kattis,
            'resume-link': contact.resume
        };

        Object.entries(socialLinks).forEach(([key, value]) => {
            if (key === 'resume-link') {
                this.handleResumeLinks(value);
                // Also update mobile resume link
                document.querySelectorAll('.mobile-action-link.resume-link').forEach(el => {
                    if (value && !value.includes('undefined')) {
                        el.setAttribute('href', value);
                        el.classList.remove('disabled');
                    }
                });
                return;
            }
            
            const elements = document.querySelectorAll(`.social-link.${key}, .mobile-action-link.${key}`);
            elements.forEach(el => {
                if (value && !value.includes('undefined')) {
                    el.setAttribute('href', value);
                    el.classList.remove('disabled');
                    if (!el.classList.contains('mobile-action-link')) {
                        el.style.display = 'flex';
                    }
                }
            });
        });

        // Full History link
        const historyUrl = contact.full_history;
        const historyLink = document.querySelector('.full-history-link');
        if (historyLink && historyUrl && !historyUrl.toLowerCase().includes('coming soon')) {
            historyLink.setAttribute('href', historyUrl);
            document.querySelector('#full-history-container').style.display = 'block';
        }

        // Venmo
        document.querySelectorAll('.venmo-btn').forEach(btn => {
            if (contact.venmo) {
                btn.setAttribute('href', contact.venmo);
                btn.style.display = 'inline-flex';
            }
        });
    }

    handleResumeLinks(url) {
        const container = document.querySelector('.resume-combined-link');
        if (!container || !url) return;
        
        container.style.display = 'flex';
        container.title = 'View Resume';
        
        container.onclick = (e) => {
            window.open(url, '_blank');
        };

        const viewEl = container.querySelector('.resume-view');
        if (viewEl) {
            viewEl.setAttribute('href', url);
            viewEl.onclick = (e) => e.stopPropagation();
        }
        
        const downloadEl = container.querySelector('.resume-download');
        if (downloadEl) {
            let downloadUrl = url;
            const idMatch = url.match(/\/d\/(.+?)\//);
            if (idMatch && idMatch[1]) {
                downloadUrl = `https://drive.google.com/uc?export=download&id=${idMatch[1]}`;
            }
            downloadEl.setAttribute('href', downloadUrl);
            downloadEl.onclick = (e) => e.stopPropagation();
        }
    }

    renderAbout(about) {
        if (!about) return;

        if (about.mainText) this.setHTML('#about .section-description', about.mainText);

        const extendedKey = Object.keys(about).find(k => k.toLowerCase() === 'extended');
        if (extendedKey) {
            const extended = about[extendedKey];
            const content = typeof extended === 'string' ? extended : (extended.description || '');
            this.setHTML('#aboutAdditional .section-description', content);
            document.querySelector('#about .btn-secondary').style.display = 'inline-block';
        }
    }

    renderEducation(education) {
        if (!education) return;
        const container = document.querySelector('#education-container');
        if (!container) return;
        
        container.innerHTML = '';
        Object.keys(education).forEach(key => {
            if (key === 'mainText') return;
            const edu = education[key];
            const card = this.createEducationCard({ ...edu, degree: key });
            container.appendChild(card);
        });
    }

    renderSkills(skills) {
        const container = document.querySelector('.skills-grid');
        if (!skills || !container) return;
        
        container.innerHTML = '';
        Object.keys(skills).forEach(category => {
            container.appendChild(this.createSkillCategory(category, skills[category]));
        });
    }

    renderResources(resources, customContainer = null) {
        if (!Array.isArray(resources)) return;

        const container = customContainer ? document.querySelector(customContainer) : document.querySelector('#featured-resources-container');
        if (!container) return;

        if (!customContainer) {
            container.innerHTML = '';
        }
        
        resources.forEach(res => {
            container.appendChild(this.createResourceCard(res, 'Resource'));
        });
    }

    renderSection(items, selector, cardCreator, clearContainer = true) {
        const container = document.querySelector(selector);
        if (!Array.isArray(items) || !container) return;
        
        if (clearContainer) container.innerHTML = '';
        items.forEach(item => container.appendChild(cardCreator.call(this, item)));
    }

    // --- Card Creators ---

    addHoverListeners(el, slug) {
        if (window.matchMedia("(hover: hover)").matches) {
            el.onmouseenter = () => {
                const bar = document.getElementById(`timeline-bar-${slug}`);
                if (bar) {
                    bar.classList.add('highlight-bar');
                    const stickyContainer = document.querySelector('.timeline-sticky');
                    const timelineContainer = document.getElementById('timeline-container');
                    if (stickyContainer && timelineContainer) {
                        const scrollPos = bar.offsetTop + timelineContainer.offsetTop - (stickyContainer.offsetHeight / 2) + (bar.offsetHeight / 2);
                        stickyContainer.scrollTo({ top: scrollPos, behavior: 'smooth' });
                    }
                }
            };
            el.onmouseleave = () => {
                const bar = document.getElementById(`timeline-bar-${slug}`);
                if (bar) bar.classList.remove('highlight-bar');
            };
        }
    }

    createExperienceCard(exp) {
        const card = document.createElement('div');
        const slug = this.parser.slugify(exp.title);
        card.className = 'card';
        card.id = `card-${slug}`;
        card.innerHTML = `
            <div class="card-header">
                <div>
                    <h3 class="card-title">${exp.title}</h3>
                    <p class="card-subtitle">${exp.company || ''}</p>
                </div>
                <div class="card-meta">${exp.dates || ''}</div>
            </div>
            <p class="card-description">${exp.description || ''}</p>
            ${this.renderTags(exp.tags)}
        `;
        this.addHoverListeners(card, slug);
        return card;
    }

    createPublicationCard(pub) {
        const card = document.createElement('div');
        const slug = this.parser.slugify(pub.title);
        card.className = 'card publication-card';
        card.id = `card-${slug}`;
        // Bold Tyler's name in the author list so his position is easy to spot.
        const authors = (pub.authors || '')
            .split(',')
            .map(a => a.trim())
            .filter(Boolean)
            .map(a => /moessing/i.test(a) ? `<strong>${a}</strong>` : a)
            .join(', ');
        card.innerHTML = `
            <div class="card-header">
                <div>
                    <h3 class="card-title">${pub.title}</h3>
                    <p class="card-subtitle">${pub.company || ''}</p>
                </div>
                <div class="card-meta">${pub.dates || ''}</div>
            </div>
            ${pub.type ? `<p class="publication-type">${pub.type}</p>` : ''}
            ${authors ? `<p class="publication-authors">${authors}</p>` : ''}
            <p class="card-description">${pub.description || ''}</p>
            ${pub.link ? `<div class="project-actions">
                <a href="${pub.link}" target="_blank" rel="noopener" class="btn btn-primary btn-sm">${pub.doi ? `DOI: ${pub.doi}` : 'Read'} →</a>
            </div>` : ''}
            ${this.renderTags(pub.tags)}
        `;
        this.addHoverListeners(card, slug);
        return card;
    }

    createEducationCard(edu) {
        const coursework = edu.coursework ? edu.coursework.split(this.parser.TAG_SPLIT_REGEX).map(c => c.trim()) : [];
        const card = document.createElement('div');
        const slug = this.parser.slugify(edu.degree);
        card.className = 'education-card';
        card.id = `card-${slug}`;
        card.innerHTML = `
            <div class="education-header">
                <h3 class="degree-title">${edu.degree}</h3>
                <p class="university">${edu.institution || ''}</p>
                <p class="education-meta">${edu.dates ? edu.dates : `Graduating ${edu.graduation || ''}`} | GPA: ${edu.gpa || ''}</p>
            </div>
            <div class="education-details">
                ${edu.emphasis ? `<p><strong>Emphasis:</strong> ${edu.emphasis}</p>` : ''}
                ${edu.minor ? `<p><strong>Minor:</strong> ${edu.minor}</p>` : ''}
                ${edu.honors ? `
                    <p><strong>Honors:</strong></p>
                    <ul class="honors-list">${edu.honors.split(this.parser.TAG_SPLIT_REGEX).map(h => `<li>${h.trim()}</li>`).join('')}</ul>
                ` : ''}
                ${coursework.length > 0 ? `
                    <p><strong>Key Coursework:</strong></p>
                    <ul>${coursework.map(c => `<li>${c}</li>`).join('')}</ul>
                ` : ''}
            </div>
        `;
        this.addHoverListeners(card, slug);
        return card;
    }

    createProjectCard(project, category = null, showTags = true) {
        const card = document.createElement('div');
        const slug = this.parser.slugify(project.title);
        card.className = project.image ? 'card has-image project-card' : 'card project-card';
        card.id = `card-${slug}`;

        let statusHTML = '';
        if (project.status) {
            const statusText = project.status === 'in-development' ? 'In Development' : 
                             project.status === 'personal-use' ? 'Personal Use' :
                             project.status.charAt(0).toUpperCase() + project.status.slice(1);
            if (project.status.toLowerCase() !== 'live') {
                statusHTML = `<span class="project-status-badge">${statusText}${project.note ? ` (${project.note})` : ''}</span>`;
            }
        }

        const catStyle = category ? this.getTagStyle(category) : null;
        const categoryTag = category ? `<span class="skill-tag category-badge" style="background: ${catStyle.bg}; color: white; border: none;">${category.toUpperCase()}</span>` : '';

        const content = `
            <div class="card-header">
                <div class="card-title-container">
                    <h3 class="card-title">${project.title}</h3>
                    ${categoryTag}
                    ${statusHTML}
                </div>
                ${project.dates ? `<div class="card-meta">${project.dates}</div>` : ''}
            </div>
            <p class="card-description">${project.description || ''}</p>
            ${project.link ? `<div class="project-actions">
                <a href="${project.link}" target="_blank" class="btn btn-primary btn-sm">View →</a>
            </div>` : ''}
            ${showTags ? `<div class="card-footer">
                ${this.renderTags(project.tags)}
            </div>` : ''}
        `;

        if (project.image) {
            card.innerHTML = `
                <div class="card-image-container">
                    <img src="${project.image}" alt="${project.title}" class="card-image project-card-image">
                </div>
                <div class="card-content-with-image">
                    ${content}
                </div>
            `;
        } else {
            card.innerHTML = content;
        }
        
        this.addHoverListeners(card, slug);
        return card;
    }

    createSkillCategory(category, skillData) {
        const div = document.createElement('div');
        div.className = 'skill-category';
        const rawSkills = typeof skillData === 'string' ? skillData : (skillData.description || '');
        const skillList = rawSkills.split(this.parser.TAG_SPLIT_REGEX).map(s => s.trim()).filter(s => s);
        div.innerHTML = `
            <h3 class="skill-category-title">${category}</h3>
            <div class="skill-list">
                ${skillList.map(skill => `<div class="skill-item">${skill.toUpperCase()}</div>`).join('')}
            </div>
        `;
        return div;
    }

    createResourceCard(resource, defaultCategory = null) {
        const card = document.createElement('div');
        const title = resource.name || resource.title;
        const slug = this.parser.slugify(title);
        const link = resource.url || resource.link;
        const why = resource.why;
        card.id = `card-${slug}`;

        let statusBadge = '';
        if (resource.status === 'coming-soon') {
            statusBadge = `<span class="skill-tag category-badge coming-soon">COMING SOON</span>`;
        }

        const linkIcon = link
            ? `<span class="resource-link-icon" aria-hidden="true"><svg class="icon icon-stroke" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" /></svg></span>`
            : '';

        const content = `
            <div class="card-header resource-header">
                <h3 class="card-title">${title}</h3>
                ${statusBadge}
            </div>
            <p class="card-description">${resource.description || ''}</p>
            ${why ? `<p class="pick-why-inline"><span class="pick-why-label">Why I love it</span> ${why}</p>` : ''}
            <div class="card-footer">
                ${this.renderTags(resource.tags)}
            </div>
        `;

        const body = resource.image
            ? `<div class="card-image-container">
                    <img src="${resource.image}" alt="${title}" class="card-image resource-logo">
                </div>
                <div class="card-content-with-image">
                    ${content}
                </div>`
            : content;

        // The link sits on top of the whole card, so anywhere you click opens it.
        const overlayLink = link
            ? `<a href="${link}" target="_blank" rel="noopener noreferrer" class="card-overlay-link" aria-label="Visit ${title}${why ? `. Why I love it: ${why}` : ''}"></a>`
            : '';

        if (why) {
            // Flip card: the front is the usual card, the back is the "why I love it" blurb.
            card.className = 'card pick-flip' + (link ? ' card-linked' : '');
            card.innerHTML = `
                <div class="pick-flip-inner">
                    <div class="pick-face pick-front${resource.image ? ' with-image' : ''}">
                        ${body}
                    </div>
                    <div class="pick-face pick-back" aria-hidden="true">
                        <span class="pick-why-label">Why I love it</span>
                        <p class="pick-back-title">${title}</p>
                        <p class="pick-back-why">${why}</p>
                        ${link ? `<span class="pick-back-cta">Visit ${linkIcon}</span>` : ''}
                    </div>
                </div>
                ${overlayLink}
            `;
        } else {
            card.className = (resource.image ? 'card has-image' : 'card') + (link ? ' card-linked' : '');
            card.innerHTML = body + overlayLink;
        }

        return card;
    }

    renderTags(tagStr) {
        if (!tagStr) return '';
        const tags = tagStr.split(this.parser.TAG_SPLIT_REGEX).map(t => t.trim()).filter(t => t);
        const hues = this.tagHues(tags);
        return `<div class="card-tags">${tags.map((t, i) => `<span class="skill-tag tag-chip" style="${this.tagChipStyle(hues[i])}">${t.toUpperCase()}</span>`).join('')}</div>`;
    }

    /**
     * Picks a hue (0-360) for each tag. Each tag prefers a hue derived from its name, so it
     * looks the same across the site, but hues already used in the same list are skipped
     * so no two tags side by side share a color.
     */
    tagHues(tags) {
        const fixed = {
            'life hack': 160, 'book': 258, 'photos': 330, 'podcast': 0,
            'self-help': 189, 'tech': 217, 'dev': 239, 'humor': 38
        };
        const minGap = Math.min(35, (360 / Math.max(tags.length, 1)) * 0.75);
        const used = [];
        const distance = (a, b) => { const d = Math.abs(a - b) % 360; return Math.min(d, 360 - d); };
        const nearestUsed = hue => used.reduce((m, u) => Math.min(m, distance(u, hue)), 360);

        return tags.map(tag => {
            const key = tag.toLowerCase();
            let preferred;
            if (key in fixed) {
                preferred = fixed[key];
            } else {
                let hash = 0;
                for (let i = 0; i < key.length; i++) hash = key.charCodeAt(i) + ((hash << 5) - hash);
                preferred = Math.abs(hash) % 360;
            }
            let hue = preferred;
            if (nearestUsed(hue) < minGap) {
                // Taken: move to the open spot farthest from every used hue, staying near the preferred one on ties.
                let best = -1;
                for (let h = 0; h < 360; h++) {
                    const gap = nearestUsed(h);
                    if (gap > best || (gap === best && distance(h, preferred) < distance(hue, preferred))) {
                        best = gap;
                        hue = h;
                    }
                }
            }
            used.push(hue);
            return hue;
        });
    }

    /**
     * Inline CSS variables consumed by .tag-chip. The text lightness for light (--tl) and dark (--dl)
     * themes is the brightest value that still meets 4.5:1 contrast against the chip's tinted background.
     */
    tagChipStyle(hue) {
        const toRgb = (h, s, l) => {
            s /= 100; l /= 100;
            const k = n => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
            return [0, 8, 4].map(n => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1)));
        };
        const lum = c => { const [r, g, b] = c.map(v => v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
        const contrast = (x, y) => { const [hi, lo] = [lum(x), lum(y)].sort((p, q) => q - p); return (hi + 0.05) / (lo + 0.05); };
        const tint = (base, alpha, under) => toRgb(hue, 90, base).map((v, i) => v * alpha + under[i] * (1 - alpha));

        const lightBg = tint(50, 0.14, [1, 1, 1]);
        const darkBg = tint(60, 0.16, [30 / 255, 41 / 255, 59 / 255]); // over the dark card colour
        let tl = 48;
        while (tl > 15 && contrast(toRgb(hue, 85, tl), lightBg) < 4.6) tl--;
        let dl = 60;
        while (dl < 92 && contrast(toRgb(hue, 90, dl), darkBg) < 4.6) dl++;
        return `--h: ${hue}; --tl: ${tl}%; --dl: ${dl}%;`;
    }

    getTagStyle(tagName) {
        if (!tagName) return { bg: 'var(--bg-tertiary)', text: 'var(--text-secondary)' };
        
        const tag = tagName.toLowerCase().trim();
        
        // Specific category colors
        if (tag === 'life hack') return { bg: 'var(--color-life-hack)', text: '#fff' };
        if (tag === 'book') return { bg: 'var(--color-book)', text: '#fff' };
        if (tag === 'photos') return { bg: 'var(--color-photos)', text: '#fff' };
        if (tag === 'podcast') return { bg: 'var(--color-podcast)', text: '#fff' };
        if (tag === 'self-help') return { bg: 'var(--color-self-help)', text: '#fff' };
        if (tag === 'tech') return { bg: 'var(--color-tech)', text: '#fff' };
        if (tag === 'dev') return { bg: 'var(--color-dev)', text: '#fff' };
        if (tag === 'humor') return { bg: 'var(--color-humor)', text: '#fff' };
        if (tag === 'picks') return { bg: 'var(--color-photos)', text: '#fff' };
        if (tag === 'projects') return { bg: 'var(--color-project)', text: '#fff' };

        // Simple hash function to get a consistent index
        let hash = 0;
        for (let i = 0; i < tagName.length; i++) {
            hash = tagName.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        const index = (Math.abs(hash) % 8) + 1; // 1-8 based on our variables
        return {
            bg: `var(--tag-${index}-bg)`,
            text: `var(--tag-${index}-text)`
        };
    }
}
