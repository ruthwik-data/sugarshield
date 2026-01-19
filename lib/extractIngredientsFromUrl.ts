export interface ExtractionResult {
    text: string | null;
    confidence: number; // 0 to 1
    source: 'HTML_META' | 'HTML_BODY' | 'NONE';
}

/**
 * Parses HTML content to extract ingredients using heuristics.
 */
export function parseIngredientsFromHtml(html: string): ExtractionResult {
    // Simple heuristic cleanup (remove scripts/styles)
    const cleanHtml = html
        .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gim, ' ')
        .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gim, ' ')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ');

    // Strategy 1: Look for explicit "Ingredients" header followed by text
    // We look for "Ingredients:" followed by a reasonable amount of text
    const ingredientPatterns = [
        /ingredients?\s*[:\-]\s*([a-z0-9\s,().%]+)/i,
        /ingredients?\s*list\s*[:\-]\s*([a-z0-9\s,().%]+)/i,
        /contains\s*[:\-]\s*([a-z0-9\s,().%]+)/i,
    ];

    for (const pattern of ingredientPatterns) {
        const match = cleanHtml.match(pattern);
        if (match && match[1]) {
            const candidate = match[1].trim();

            // Clean up: stop at common next-section headers
            const stopWordsRegex = /\b(nutrition|directions|instructions|warnings|distrib|manufact|store|allergen)\b/i;
            const stopMatch = candidate.match(stopWordsRegex);
            const refinedCandidate = stopMatch ? candidate.substring(0, stopMatch.index).trim() : candidate;

            // STRICT Heuristics per Tier-1 requirements
            // 1. Length check (< 80 chars = failure/low confidence)
            if (refinedCandidate.length < 80) {
                return {
                    text: refinedCandidate,
                    confidence: 0.1, // Very low
                    source: 'HTML_BODY',
                };
            }

            // 2. Structure check (must have commas or semicolons)
            if (!refinedCandidate.includes(',') && !refinedCandidate.includes(';')) {
                return {
                    text: refinedCandidate,
                    confidence: 0.2, // Low
                    source: 'HTML_BODY',
                };
            }

            // If passes checks
            return {
                text: refinedCandidate,
                confidence: 0.9, // High confidence extraction
                source: 'HTML_BODY',
            };
        }
    }

    return { text: null, confidence: 0, source: 'NONE' };
}

export async function extractIngredientsFromUrl(url: string): Promise<ExtractionResult> {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (compatible; SugarShield/1.0; +http://localhost:3000)',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch page: ${response.status}`);
        }

        const html = await response.text();
        return parseIngredientsFromHtml(html);
    } catch (error) {
        console.warn('Extraction error:', error);
        return { text: null, confidence: 0, source: 'NONE' };
    }
}
