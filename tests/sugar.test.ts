import { describe, it, expect } from 'vitest';
import { classifyProduct } from '../lib/classifier';
import { logMetric } from '../scripts/log-metrics';

describe('SugarShield Classifier Inputs (PASS / FAIL / WARN)', () => {
    it('correctly classifies an obvious sugar product as FAIL', () => {
        const product = 'High Sugar Cookie';
        const ingredients = 'Sugar, enriched flour, high fructose corn syrup, cocoa';

        const result = classifyProduct({
            productName: product,
            ingredientsText: ingredients,
            source: 'LINK_MANUAL'
        });

        expect(result.classification).toBe('FAIL');

        // Log latency metric simulation or simply count correctness (which we do in eval.test.ts)
    });

    it('correctly classifies a hidden sugar product as WARN or FAIL', () => {
        const product = 'Hidden Sugar Snack';
        const ingredients = 'Skim milk, corn syrup solids, modified food starch, vitamin A';

        const result = classifyProduct({
            productName: product,
            ingredientsText: ingredients,
            source: 'LINK_MANUAL'
        });

        expect(['WARN', 'FAIL']).toContain(result.classification);
    });

    it('correctly classifies a clean product as PASS', () => {
        const product = 'Clean Snack';
        const ingredients = 'Almonds, sea salt';

        const result = classifyProduct({
            productName: product,
            ingredientsText: ingredients,
            source: 'LINK_MANUAL'
        });

        expect(result.classification).toBe('PASS');
    });
});
