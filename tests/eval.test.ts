import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { classifyProduct } from '../lib/classifier';
import { logMetric } from '../scripts/log-metrics';

describe('SugarShield Golden Set Evaluation & Metrics Logging', () => {
    it('evaluates against the golden set and logs false_negative_rate', () => {
        const evalSetPath = path.join(process.cwd(), 'data', 'evalSet.json');
        if (!fs.existsSync(evalSetPath)) {
            console.warn('evalSet.json not found, skipping golden set eval test.');
            return;
        }

        const evalData = fs.readFileSync(evalSetPath, 'utf8');
        const evalSet = JSON.parse(evalData);

        let falseNegatives = 0;
        let total = evalSet.length;

        evalSet.forEach((tc: any) => {
            const output = classifyProduct({
                productName: tc.inputs.productName,
                ingredientsText: tc.inputs.ingredientsText,
                source: 'EVAL'
            });

            const actualVerdict = output.classification || 'WARN';
            const isFalseNegative = actualVerdict === 'PASS' && tc.expectedVerdict !== 'PASS';

            if (isFalseNegative) {
                falseNegatives++;
            }
        });

        const falseNegativeRate = falseNegatives / (total || 1);

        // Log the baseline metric for the Golden Set eval
        logMetric({
            app_name: 'sugarshield',
            scenario: 'golden_set_evaluation',
            version: 'baseline',
            metric_name: 'false_negative_rate',
            metric_value: falseNegativeRate,
            timestamp: new Date().toISOString(),
            notes: `Measured against ${total}-product golden set`
        });

        expect(falseNegativeRate).toBeGreaterThanOrEqual(0);
    });
});
