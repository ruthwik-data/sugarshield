'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClassificationResult } from '@/lib/types';

// Updated type helper to be safe
type VerdictKey = 'PASS' | 'WARN' | 'FAIL';

const verdictConfig: Record<
  VerdictKey,
  { bg: string; text: string; border: string; icon: string; label: string }
> = {
  PASS: {
    bg: 'bg-emerald-50 text-emerald-900',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: 'check_circle',
    label: 'Safe',
  },
  WARN: {
    bg: 'bg-amber-50 text-amber-900',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: 'warning',
    label: 'Caution',
  },
  FAIL: {
    bg: 'bg-red-50 text-red-900',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: 'cancel',
    label: 'Avoid',
  },
};

function getVerdict(result: ClassificationResult | any): VerdictKey {
  // Safe accessor for inconsistent backend formats
  const raw =
    result?.classification ??
    result?.verdict ??
    'WARN';

  const v = String(raw).trim().toUpperCase();
  if (v === 'PASS') return 'PASS';
  if (v === 'FAIL') return 'FAIL';
  return 'WARN';
}

function getPrimaryTrigger(result: ClassificationResult | any): string | null {
  const matchedTerms = Array.isArray(result?.matchedTerms) ? result.matchedTerms : [];
  if (matchedTerms.length === 0) return null;

  // Prioritize added sugar over hidden sugar, first one found is usually most relevant
  // assuming list is sorted or we just pick the first severe one.
  // In a real app we might sort by severity config.
  return matchedTerms[0].term;
}

export default function ResultCard({ result }: { result: ClassificationResult | any }) {
  const verdict = getVerdict(result);
  const config = verdictConfig[verdict];
  const confidence = Math.round((Number(result?.confidence) || 0) * 100);
  const formattedReasons = Array.isArray(result?.reasons) ? result.reasons : [];
  const matchedTerms = Array.isArray(result?.matchedTerms) ? result.matchedTerms : [];
  const primaryTrigger = getPrimaryTrigger(result);

  // Feedback State
  const [feedback, setFeedback] = useState<'yes' | 'unsure' | 'no' | null>(null);
  const [showConfidenceExplainer, setShowConfidenceExplainer] = useState(false);

  useEffect(() => {
    // Reset feedback when result changes
    setFeedback(null);
  }, [result]);

  const handleFeedback = (val: 'yes' | 'unsure' | 'no') => {
    setFeedback(val);
    const key = `sugarshield_feedback_${Date.now()}`;
    localStorage.setItem(key, JSON.stringify({
      val,
      verdict,
      trigger: primaryTrigger,
      timestamp: new Date().toISOString()
    }));
  };

  const handleExport = () => {
    const text = `SugarShield Analysis\n\nVerdict: ${verdict}\nConfidence: ${confidence}%\nTrigger: ${primaryTrigger || 'None identified'}\n\nReasons:\n${formattedReasons.map((r: string) => `• ${r}`).join('\n')}\n\n${result.notes || ''}`;

    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: 'SugarShield Result',
        text: text,
      }).catch(console.error);
    } else {
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sugarshield-${verdict.toLowerCase()}-${Date.now()}.txt`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="bg-paper rounded-3xl p-6 shadow-xl border border-black/5 ring-1 ring-black/5 relative overflow-hidden"
    >
      {/* status header */}
      <div className={`absolute top-0 left-0 right-0 h-2 ${verdict === 'PASS' ? 'bg-emerald-500' : verdict === 'FAIL' ? 'bg-red-500' : 'bg-amber-400'
        }`} />

      <div className="flex justify-between items-start mt-2 mb-6">
        <div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-2 ${config.bg} ${config.border} border relative overflow-hidden`}>
            <span className="w-1.5 h-1.5 rounded-full bg-current" />
            {config.label}
            <span className="absolute inset-0 animate-shimmer pointer-events-none" />
          </span>
          <h2 className="text-2xl font-bold text-ink">
            {verdict === 'PASS' ? 'Looks Good!' : verdict === 'FAIL' ? 'High Sugar' : 'Be Careful'}
          </h2>
        </div>

        <div className="text-right">
          <div className="relative">
            <div
              className={`text-2xl font-black relative inline-block cursor-pointer transition-colors ${showConfidenceExplainer ? 'text-ink' : 'text-ink/20 hover:text-ink/40'
                }`}
              onClick={() => setShowConfidenceExplainer(!showConfidenceExplainer)}
            >
              {confidence}<span className="text-sm align-top">%</span>
              <span className="block text-[10px] font-medium text-zinc-400 uppercase tracking-widest">Confidence</span>
            </div>

            <AnimatePresence>
              {showConfidenceExplainer && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-black/5 p-3 z-50 text-left"
                >
                  <p className="text-xs font-semibold text-ink mb-1">
                    {confidence >= 90 ? 'High Confidence' : confidence >= 70 ? 'Medium Confidence' : 'Low Confidence'}
                  </p>
                  <p className="text-[10px] text-zinc-500 leading-normal">
                    {result.ingredients_source === 'LINK_MANUAL' ? 'Based on manual ingredient entry.' :
                      result.ingredients_source === 'PASTED' ? 'Based on pasted text.' :
                        result.ingredients_source === 'URL_EXTRACTED' ? 'Ingredients found on webpage.' :
                          'Visual match from OCR scan.'}
                  </p>
                  <div className="absolute -top-1.5 right-6 w-3 h-3 bg-white border-t border-l border-black/5 transform rotate-45" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Primary Trigger & Explanations */}
      {result.triggers && result.triggers.length > 0 ? (
        <div className="space-y-4 mb-6">
          <div className="bg-cream rounded-2xl p-4 border border-cocoa/10">
            <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <span className="text-cocoa">⚠️</span> Sugar Triggers
            </h3>
            <div className="space-y-3">
              {result.triggers.map((trigger: any, i: number) => (
                <div key={i} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-ink">{trigger.term}</span>
                    <span className="text-[10px] font-medium px-2 py-0.5 bg-cocoa/10 text-cocoa rounded-full">
                      {trigger.category}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-600 leading-snug">
                    {trigger.reason}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : primaryTrigger && verdict !== 'PASS' ? (
        // Legacy fallback for primary trigger
        <div className="mb-6 bg-cream rounded-2xl p-4 border border-cocoa/10 flex items-start gap-3">
          <div className="text-2xl mt-0.5">🚨</div>
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">Primary Trigger</p>
            <p className="text-ink font-medium">
              Detected {primaryTrigger} → <span className={`font-bold ${config.text}`}>{verdict}</span>
            </p>
          </div>
        </div>
      ) : null}

      {/* Analysis Content */}
      <div className="space-y-6">
        {result.summary && (
          <div className="bg-subtle rounded-2xl p-4 border border-black/5">
            <h3 className="text-sm font-semibold text-ink mb-2">Analysis Summary</h3>
            <p className="text-sm text-zinc-600 leading-relaxed">{result.summary}</p>
          </div>
        )}

        {/* Legacy Reason List (fallback if no strict triggers but reasons exist) */}
        {!result.triggers?.length && formattedReasons.length > 0 && (
          <div className="bg-subtle rounded-2xl p-4 border border-black/5">
            <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
              <span className="text-cocoa">📋</span> Analysis Details
            </h3>
            <ul className="space-y-3">
              {formattedReasons.map((reason: string, i: number) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-600 leading-relaxed">
                  <span className={`mt-1.5 min-w-[6px] h-[6px] rounded-full ${config.text} bg-current`} />
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {matchedTerms.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-ink mb-3 flex items-center gap-2">
              <span className="text-cocoa">🔍</span> Detected Ingredients
            </h3>
            <div className="flex flex-wrap gap-2">
              {matchedTerms.map((mt: any, i: number) => (
                <span
                  key={i}
                  className="px-3 py-1.5 bg-cocoa/5 text-cocoa rounded-xl text-xs font-medium border border-cocoa/10"
                >
                  {mt.term}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions & Note */}
        <div className="pt-6 border-t border-black/5 space-y-4">
          {result?.notes && (
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              {result.notes}
            </p>
          )}

          {/* Feedback Loop */}
          <div className="bg-subtle rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs font-medium text-zinc-500">Does this result look right?</span>
            {feedback ? (
              <span className="text-xs text-emerald-600 font-medium">Thanks for your feedback!</span>
            ) : (
              <div className="flex gap-2">
                <button onClick={() => handleFeedback('yes')} className="px-3 py-1 bg-white border border-black/5 rounded-lg text-xs hover:bg-emerald-50 hover:text-emerald-700 transition">Yes</button>
                <button onClick={() => handleFeedback('unsure')} className="px-3 py-1 bg-white border border-black/5 rounded-lg text-xs hover:bg-amber-50 hover:text-amber-700 transition">Not sure</button>
                <button onClick={() => handleFeedback('no')} className="px-3 py-1 bg-white border border-black/5 rounded-lg text-xs hover:bg-red-50 hover:text-red-700 transition">Incorrect</button>
              </div>
            )}
          </div>

          {/* Export Action */}
          <div className="flex justify-end">
            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-black/5 transition-colors text-xs font-semibold text-cocoa"
            >
              <span>📝</span> Save to Notes
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
