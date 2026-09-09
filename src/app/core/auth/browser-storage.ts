/** Storage denial is an unavailable session, never evidence of authentication. */
export function browserStorage(): Storage | undefined {
    try { return window.localStorage; } catch { return undefined; }
}

export function readStoredValue(key: string): string | null {
    try { return browserStorage()?.getItem(key) ?? null; } catch { return null; }
}

export function removeStoredValue(key: string): void {
    try { browserStorage()?.removeItem(key); } catch { /* Already inaccessible. */ }
}
