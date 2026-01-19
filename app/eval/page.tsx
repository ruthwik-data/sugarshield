'use client';

import Link from 'next/link';
import { useState, useMemo } from 'react';
import evalSet from '@/data/evalSet.json';
import { classifyProduct } from '@/lib/classifier';
import { ClassificationResult } from '@/lib/types';

type EvalCase = typeof evalSet[0];

// Helper to map 0-1 confidence to High/Medium/Low
function getConfidenceLabel(score: number): 'High' | 'Medium' | 'Low' {
  if (score >= 0.9) return 'High';
  if (score >= 0.7) return 'Medium';
  return 'Low';
}

function getConfidenceReason(inputType: string): string {
  if (inputType.includes('URL')) return 'URL-based extraction';
  if (inputType === 'PASTED') return 'Full ingredient list';
  if (inputType === 'VISION') return 'OCR confidence';
  return 'Heuristic analysis';
}

function getVerdictLabel(verdict: string): string {
  if (verdict === 'PASS') return 'No Added Sugar Detected';
  if (verdict === 'FAIL') return 'High Sugar Risk';
  if (verdict === 'WARN') return 'Potential Sugar Risk';
  return verdict;
}

export default function EvalPage() {
  const [filter, setFilter] = useState<'ALL' | 'PASS' | 'WARN' | 'FAIL' | 'FALSE_NEG'>('ALL');
  const [evalMode, setEvalMode] = useState<'STRICT' | 'LENIENT'>('STRICT');

  // RUN EVALS LIVE
  const results = useMemo(() => {
    return evalSet.map((tc) => {
      const output = classifyProduct({
        productName: tc.inputs.productName,
        ingredientsText: tc.inputs.ingredientsText,
        source: 'EVAL'
      });

      // Logic: Verdict correct?
      const actualVerdict = output.classification || 'WARN'; // Default fallback
      const isCorrect = actualVerdict === tc.expectedVerdict;

      // Logic: False Negative? (Actual=PASS but Expected!=PASS)
      const isFalseNegative = actualVerdict === 'PASS' && tc.expectedVerdict !== 'PASS';

      // Logic: Trigger Match?
      const actualTriggers = (output.matchedTerms || []).map(m => m.term.toLowerCase());
      const expectedTriggers = (tc.expectedTriggers || []).map(t => t.toLowerCase());
      const triggerMatch = expectedTriggers.length === 0
        ? true
        : expectedTriggers.some(et => actualTriggers.includes(et));

      return {
        ...tc,
        actualVerdict,
        actualTriggers: (output.matchedTerms || []).map(m => m.term),
        confidenceScore: output.confidence,
        confidenceLabel: getConfidenceLabel(output.confidence),
        isCorrect,
        isFalseNegative,
        triggerMatch
      };
    });
  }, []);

  // CALCULATE METRICS
  const metrics = useMemo(() => {
    if (evalMode === 'LENIENT') {
      // SIMULATED METRICS for Lenient Mode
      return {
        accuracy: 72,
        falseNegatives: 3,
        triggerMatchRate: 65,
        isSimulated: true
      };
    }

    const total = results.length;
    const correct = results.filter(r => r.isCorrect).length;
    const falseNegatives = results.filter(r => r.isFalseNegative).length;
    const triggerMatches = results.filter(r => r.triggerMatch).length;

    return {
      accuracy: Math.round((correct / total) * 100),
      falseNegatives,
      triggerMatchRate: Math.round((triggerMatches / total) * 100),
      isSimulated: false
    };
  }, [results, evalMode]);

  const filteredResults = results.filter(r => {
    if (filter === 'ALL') return true;
    if (filter === 'FALSE_NEG') return r.isFalseNegative;
    return r.actualVerdict === filter;
  });

  return (
    <div className="min-h-screen sugar-bg text-ink p-6 sm:p-12 pb-24">
      <div className="max-w-6xl mx-auto">

        {/* MODEL INTENT BANNER */}
        <div className="bg-white border border-black/5 rounded-xl p-4 mb-8 shadow-sm flex items-start gap-4">
          <div className="text-xl">ℹ️</div>
          <div>
            <h3 className="font-bold text-sm text-ink mb-1">Model Intent</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">
              SugarShield is intentionally optimized to minimize false negatives (missed sugar detection), even at the cost of lower overall accuracy.
            </p>
          </div>
        </div>

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2">Model Evaluation</h1>
            <p className="text-zinc-500 max-w-lg text-sm">
              Live performance metrics against the "Golden Set" of known products.
              Transparency builds trust.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* MODE TOGGLE */}
            <div className="bg-white border border-black/10 rounded-lg p-1 flex">
              <button
                onClick={() => setEvalMode('STRICT')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${evalMode === 'STRICT' ? 'bg-ink text-white shadow-sm' : 'text-zinc-500 hover:bg-zinc-50'}`}
              >
                Strict Mode
              </button>
              <button
                onClick={() => setEvalMode('LENIENT')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${evalMode === 'LENIENT' ? 'bg-ink text-white shadow-sm' : 'text-zinc-500 hover:bg-zinc-50'}`}
              >
                Lenient Mode
              </button>
            </div>
            <Link href="/" className="px-4 py-2 bg-white border border-black/10 rounded-xl shadow-sm hover:shadow-md transition text-sm font-medium">
              ← Back to App
            </Link>
          </div>
        </div>

        {evalMode === 'LENIENT' && (
          <div className="mb-6 text-center">
            <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full border border-amber-100">
              Lenient Mode illustrates an alternative policy trade-off with higher pass rates but increased false negatives.
            </span>
          </div>
        )}

        {/* Top Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-paper p-6 rounded-3xl shadow-sm border border-black/5 flex flex-col items-center text-center">
            <span className="text-4xl font-black text-ink mb-1">{metrics.accuracy}%</span>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">Policy Alignment Rate</span>
            <p className="text-[10px] text-zinc-400 max-w-[200px] leading-tight">
              This reflects alignment with SugarShield’s strict sugar-detection policy, not raw prediction accuracy.
            </p>
          </div>
          <div className="bg-paper p-6 rounded-3xl shadow-sm border border-black/5 flex flex-col items-center text-center">
            <span className={`text-4xl font-black mb-1 ${metrics.falseNegatives === 0 ? 'text-emerald-500' : 'text-red-500'}`}>
              {metrics.falseNegatives}
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">False Negatives</span>
          </div>
          <div className="bg-paper p-6 rounded-3xl shadow-sm border border-black/5 flex flex-col items-center text-center">
            <span className="text-4xl font-black text-ink mb-1">{metrics.triggerMatchRate}%</span>
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-400">Trigger Match Rate</span>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['ALL', 'PASS', 'WARN', 'FAIL', 'FALSE_NEG'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${filter === f
                ? 'bg-ink text-paper shadow-md'
                : 'bg-white text-zinc-500 border border-black/5 hover:bg-zinc-50'
                }`}
            >
              {f === 'FALSE_NEG' ? 'False Negatives' : f}
            </button>
          ))}
        </div>

        {/* Results Table */}
        <div className={`bg-paper rounded-3xl shadow-sm border border-black/5 overflow-hidden ${evalMode === 'LENIENT' ? 'opacity-50 pointer-events-none grayscale' : ''}`}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-subtle border-b border-black/5 text-[10px] uppercase tracking-wider text-zinc-400 font-semibold">
                  <th className="p-4 w-48">Example</th>
                  <th className="p-4 w-32">Input Type</th>
                  <th className="p-4 w-32">Expected</th>
                  <th className="p-4 w-32">Actual</th>
                  <th className="p-4 w-36">Confidence</th>
                  <th className="p-4 w-48">Trigger(s)</th>
                  <th className="p-4">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredResults.map((r) => (
                  <tr key={r.id} className="group hover:bg-cream/50 transition-colors text-sm">
                    <td className="p-4">
                      <div className="font-medium text-ink">{r.name}</div>
                      <div className="text-xs text-zinc-400 truncate max-w-[180px]">{r.inputs.productName}</div>
                    </td>
                    <td className="p-4 text-xs text-zinc-500">
                      {r.inputType}
                    </td>
                    <td className="p-4">
                      <VerdictBadge verdict={r.expectedVerdict} />
                    </td>
                    <td className="p-4">
                      <VerdictBadge verdict={r.actualVerdict} />
                      {!r.isCorrect && (
                        <span className="ml-2 inline-block w-2 h-2 rounded-full bg-red-500" title="Mismatch" />
                      )}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-0.5">
                        <span className={`text-xs font-medium w-fit px-2 py-0.5 rounded ${r.confidenceLabel === 'High' ? 'bg-emerald-100 text-emerald-800' :
                          r.confidenceLabel === 'Medium' ? 'bg-amber-100 text-amber-800' :
                            'bg-zinc-100 text-zinc-600'
                          }`}>
                          {r.confidenceLabel}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          {getConfidenceReason(r.inputType)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {r.actualTriggers.slice(0, 3).map(t => (
                          <span key={t} className="inline-block px-1.5 py-0.5 bg-cocoa/5 border border-cocoa/10 rounded text-[10px] text-cocoa font-medium">
                            {t}
                          </span>
                        ))}
                        {r.actualTriggers.length === 0 && <span className="text-zinc-300">-</span>}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-zinc-500 max-w-xs leading-relaxed">
                      {r.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Table Footer */}
          <div className="p-4 bg-subtle border-t border-black/5">
            <p className="text-xs text-zinc-400 text-center">
              * Live evaluation data. Lenient mode results are simulated for comparison.
            </p>
          </div>
        </div>

        {/* PM INSIGHT CALLOUT */}
        <div className="mt-8 bg-cocoa/5 rounded-2xl p-6 border border-cocoa/10">
          <h3 className="text-xs font-bold text-cocoa uppercase tracking-wider mb-2">PM Insight</h3>
          <p className="text-sm text-zinc-700 leading-relaxed italic">
            “Several WARN results (e.g., Diet Soda, Coconut Water) are intentional. These products contain sweeteners or naturally occurring sugars that are debated in nutritional science. SugarShield defaults to caution rather than silent pass to preserve user trust.”
          </p>
        </div>

      </div>
    </div>
  );
}

function VerdictBadge({ verdict }: { verdict: string }) {
  const styles =
    verdict === 'PASS' ? 'bg-emerald-100 text-emerald-800' :
      verdict === 'FAIL' ? 'bg-red-100 text-red-800' :
        'bg-amber-100 text-amber-800';

  const label = getVerdictLabel(verdict);

  return (
    <span className={`inline-flex items-center justify-center px-2 py-1 rounded text-[10px] font-bold w-full max-w-[140px] text-center ${styles}`}>
      {label}
    </span>
  );
}
