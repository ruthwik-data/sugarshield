export type ConfidenceLabel = 'HIGH' | 'MEDIUM' | 'LOW';
export type IngredientSource = 'PASTED' | 'URL_EXTRACTED' | 'UNKNOWN';

export function calculateConfidence(
    source: IngredientSource,
    textLength: number,
    matchCount: number
): { score: number; label: ConfidenceLabel } {

    // 1. Source Score
    let sourceScore = 0.10; // UNKNOWN
    if (source === 'PASTED') sourceScore = 0.45;
    if (source === 'URL_EXTRACTED') sourceScore = 0.25;

    // 2. Length Score
    let lengthScore = 0.05; // < 80 chars
    if (textLength > 200) {
        lengthScore = 0.25;
    } else if (textLength >= 80) {
        lengthScore = 0.15;
    }

    // 3. Match Score
    let matchScore = 0.05; // 0 terms
    if (matchCount >= 2) {
        matchScore = 0.30;
    } else if (matchCount === 1) {
        matchScore = 0.18;
    }

    // Calculate total
    const rawScore = sourceScore + lengthScore + matchScore;

    // Clamp between 0 and 1
    const score = Math.max(0, Math.min(1, rawScore));

    // Determine Label
    let label: ConfidenceLabel = 'LOW';
    if (score >= 0.75) {
        label = 'HIGH';
    } else if (score >= 0.55) {
        label = 'MEDIUM';
    }

    return { score, label };
}
