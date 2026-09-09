/** Escape data at the HTML rendering boundary; never rewrite stored labels. */
export function tooltipText(value: unknown): string {
    const entities: Record<string, string> = {
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    };
    return String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
}
