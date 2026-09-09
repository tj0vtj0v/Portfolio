/** Only known private application paths can be used as post-login destinations. */
export function safeReturnUrl(value: string | null): string | undefined {
    if (!value || /[\\\u0000-\u001f\u007f]/.test(value)) return undefined;
    return /^\/(account|settings|accounting|fuel)(\/|\?|#|$)/.test(value) ? value : undefined;
}
