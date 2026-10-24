/**
 * HTML component loader. Replaces every <div data-component="name"> with the
 * contents of components/name.html. Components may include other components.
 */
export async function loadComponents(root = document) {
    const slots = [...root.querySelectorAll('[data-component]')];

    await Promise.all(slots.map(async (slot) => {
        const name = slot.dataset.component;
        const res = await fetch(`components/${name}.html`);
        if (!res.ok) throw new Error(`Failed to load component "${name}": ${res.status}`);

        const template = document.createElement('template');
        template.innerHTML = await res.text();
        await loadComponents(template.content);
        slot.replaceWith(template.content);
    }));
}
