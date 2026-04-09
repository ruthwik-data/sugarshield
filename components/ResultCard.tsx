'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClassificationResult } from '@/lib/types';

type VerdictKey = 'PASS' | 'WARN' | 'FAIL';

const verdictConfig: Record<
  VerdictKey,
  { bg: string; text: string; border: string; icon: string; label: string; heroColor: string }
> = {
  PASS: {
    bg: 'bg-emerald-50 text-emerald-900',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    icon: 'check_circle',
    label: 'Safe',
    heroColor: 'text-emerald-600',
  },
  WARN: {
    bg: 'bg-amber-50 text-amber-900',
    text: 'text-amber-700',
    border: 'border-amber-200',
    icon: 'warning',
    label: 'Caution',
    heroColor: 'text-amber-500',
  },
  FAIL: {
    bg: 'bg-red-50 text-red-900',
    text: 'text-red-700',
    border: 'border-red-200',
    icon: 'cancel',
    label: 'Avoid',
    heroColor: 'text-red-600',
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

  const [feedback, setFeedback] = useState<'yes' | 'unsure' | 'no' | null>(null);

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

  const confidenceLabel = confidence >= 90 ? 'High' : confidence >= 70 ? 'Medium' : 'Low';

  const triggerBadges: string[] = result.triggers?.length
    ? result.triggers.map((t: any) => t.term)
    : matchedTerms.map((mt: any) => mt.term);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="bg-white rounded-2xl p-5 shadow-sm border border-zinc-100 space-y-4"
    >
      {/* 1. Verdict */}
      <div className="space-y-0.5">
        <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Verdict</p>
        <p className={`text-2xl font-semibold ${config.heroColor}`}>
          {config.label}
        </p>
      </div>

      {/* 2. Confidence */}
      <p className="text-sm text-zinc-500">
        Confidence: <span className="font-medium text-zinc-700">{confidence}%</span>{' '}
        <span className="text-zinc-400">({confidenceLabel})</span>
      </p>

      {/* 3. Sugar Trigger Badges */}
      {triggerBadges.length > 0 && (
        <div>
          <p className="text-xs text-zinc-400 uppercase tracking-wider font-semibold mb-2">Detected Triggers</p>
          <div className="flex flex-wrap gap-1.5">
            {triggerBadges.map((term, i) => (
              <span
                key={i}
                className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-zinc-100 text-zinc-600"
              >
                {term}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4. Explanation */}
      <p className="text-sm text-zinc-400 leading-relaxed">
        This product contains ingredients associated with added or hidden sugars.
      </p>

      {/* Footer */}
      <div className="pt-3 border-t border-zinc-100 space-y-3">
        {result?.notes && (
          <p className="text-xs text-zinc-400 leading-relaxed">
            {result.notes}
          </p>
        )}

        {/* Feedback */}
        <div className="bg-zinc-50 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-xs font-medium text-zinc-500">Does this result look right?</span>
          {feedback ? (
            <span className="text-xs text-emerald-600 font-medium">Thanks for your feedback!</span>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => handleFeedback('yes')} className="px-3 py-1 bg-white border border-zinc-200 rounded-lg text-xs hover:bg-emerald-50 hover:text-emerald-700 transition">Yes</button>
              <button onClick={() => handleFeedback('unsure')} className="px-3 py-1 bg-white border border-zinc-200 rounded-lg text-xs hover:bg-amber-50 hover:text-amber-700 transition">Not sure</button>
              <button onClick={() => handleFeedback('no')} className="px-3 py-1 bg-white border border-zinc-200 rounded-lg text-xs hover:bg-red-50 hover:text-red-700 transition">Incorrect</button>
            </div>
          )}
        </div>

        {/* Export */}
        <div className="flex justify-end">
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-zinc-100 transition-colors text-xs font-semibold text-zinc-500"
          >
            <span>📝</span> Save to Notes
          </button>
        </div>
      </div>
    </motion.div>
  );
}
