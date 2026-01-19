import { normalizeText } from './normalizeText';
import { SUGAR_TERMS } from './sugarTerms';

/**
 * Detects presence of sugar terms in a given text.
 * Uses word boundaries to avoid false positives (e.g. "sugarcane" vs "sugar").
 */
export function detectSugar(text: string): { detected_terms: string[] } {
  if (!text) return { detected_terms: [] };

  const normalizedInput = normalizeText(text);
  const found = new Set<string>();

  SUGAR_TERMS.forEach((term) => {
    // 1. Simple includes check (fast filter)
    if (normalizedInput.includes(term)) {
      // 2. Strict Word Boundary Check
      // We escape the term for regex usage
      const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escapedTerm}\\b`, 'g');

      if (regex.test(normalizedInput)) {
        found.add(term);
      }
    }
  });

  // Convert to sorted array
  return {
    detected_terms: Array.from(found).sort()
  };
}
