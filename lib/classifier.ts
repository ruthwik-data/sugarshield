// lib/classifier.ts

import {
  AnalysisResponse,
  ClassificationResult, // Keeping for compatibility if needed, though we return AnalysisResponse which extends/replaces it in usage 
  Verdict
} from './types';
import { detectSugar } from './detectSugar';
import { getExplanation } from './explanations';
import { calculateConfidence, IngredientSource } from './confidence';

/* -------------------------------------------------------
   Core ingredient classifier
------------------------------------------------------- */

export function classifyIngredients(text: string, source: IngredientSource = 'UNKNOWN'): AnalysisResponse {
  // 1. Detect Terms
  const { detected_terms } = detectSugar(text);

  // 2. Map to Explanations (Triggers)
  const triggers = detected_terms.map(term => {
    const explanation = getExplanation(term);
    return {
      term,
      category: explanation.category,
      reason: explanation.reason
    };
  });

  // 3. Calculate Confidence
  const { score, label } = calculateConfidence(
    source,
    text ? text.length : 0,
    detected_terms.length
  );

  // 4. Determine Status & Summary
  let status: AnalysisResponse['status'] = 'OK';
  let summary = '';
  let user_message = undefined;

  // Logic Rule 1: Low confidence fallback
  if (label === 'LOW' && source !== 'PASTED') {
    status = 'NEED_INGREDIENTS';
    user_message = "We couldn’t reliably extract ingredients from this product page. Please paste the ingredient list for accurate results.";
    // Reset triggers if we are saying we need ingredients (don't show partial false flags)
    // Note: User spec says "triggers must be []"
    triggers.length = 0;
  }
  // Logic Rule 2: No terms found
  else if (detected_terms.length === 0) {
    status = 'OK';
    summary = 'No sugar-related ingredients detected in the provided ingredient list.';
  }
  // Logic Rule 3: Terms found
  else {
    status = 'OK';
    summary = `Sugar warning triggered: detected ${detected_terms.length} sugar-related ingredient(s).`;
  }

  // Determine Verdict (Legacy compatibility)
  let verdict: Verdict = 'PASS';
  if (status === 'NEED_INGREDIENTS') {
    verdict = 'WARN';
  } else if (detected_terms.length > 0) {
    verdict = 'FAIL';
  }

  return {
    status,
    ingredients_source: source,
    confidence: score,
    confidence_label: label,
    triggers,
    summary,
    user_message,

    // Legacy fields
    classification: verdict,
    verdict: verdict,
    matchedTerms: detected_terms.map(t => ({ term: t, type: 'SWEETENER' })), // simplified mapping
    reasons: triggers.map(t => `${t.term}: ${t.reason}`),
  };
}

/* -------------------------------------------------------
   Product-level wrapper
------------------------------------------------------- */

export type ClassifyProductInput =
  | string
  | {
    url?: string;
    ingredientsText?: string;
    productName?: string;
    source?: string;
  };

export function classifyProduct(input: ClassifyProductInput): AnalysisResponse {
  // 1. Handle String Input (Legacy/Error case)
  if (typeof input === 'string') {
    return {
      status: 'NEED_INGREDIENTS',
      ingredients_source: 'UNKNOWN',
      confidence: 0,
      confidence_label: 'LOW',
      triggers: [],
      summary: 'Input was not structured data.',
      user_message: 'Please provide ingredients.',

      classification: 'WARN',
      verdict: 'WARN',
      matchedTerms: [],
      reasons: ['Invalid input format'],
    };
  }

  // 2. Determine Source Type
  let source: IngredientSource = 'UNKNOWN';
  if (input.source === 'LINK_MANUAL') source = 'PASTED';
  else if (input.source === 'LINK') source = 'URL_EXTRACTED';
  else if (input.source === 'VISION') source = 'PASTED'; // Vision is effectively pasted text
  else if (input.source === 'OFF') source = 'PASTED'; // OpenFoodFacts data is reliable

  const text = input.ingredientsText || '';

  // 3. Run Analysis
  const result = classifyIngredients(text, source);

  // 4. Enrich Result with Context (if needed) if OK
  // The AnalysisResponse structure is self-contained, but we could append product name to summary if desired.
  // For now, adhering strictly to the logic in classifyIngredients.

  return result;
}
