export function normalizeText(input: string): string {
    return input
        .toLowerCase()
        .replace(/[\u0000-\u001f]/g, " ")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}
