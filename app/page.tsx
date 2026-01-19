'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ScanTab from '@/components/ScanTab';
import UploadTab from '@/components/UploadTab';
import LinkTab from '@/components/LinkTab';
import ResultCard from '@/components/ResultCard';
import TopHeader from '@/components/TopHeader';
import SegmentedTabs from '@/components/SegmentedTabs';
import DisclaimerCard from '@/components/DisclaimerCard';
import ExamplesStrip from '@/components/ExamplesStrip';
import Onboarding from '@/components/Onboarding';
import { ClassificationResult, AnalysisResponse } from '@/lib/types';
import { classifyProduct } from '@/lib/classifier';

type Tab = 'scan' | 'upload' | 'link';

type ComparisonResult = {
  resultA: AnalysisResponse;
  resultB: AnalysisResponse;
  recommendation: string;
} | null;

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('scan');
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [demoMode, setDemoMode] = useState(false);

  // Comparison State
  const [productA, setProductA] = useState('');
  const [productB, setProductB] = useState('');
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult>(null);
  const [compareError, setCompareError] = useState<string | null>(null);

  const handleResult = (res: ClassificationResult) => {
    setResult(res);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setResult(null);
  };

  const handleDemoToggle = () => {
    const newState = !demoMode;
    setDemoMode(newState);
    if (newState) {
      setActiveTab('link');
      setResult(null);
    }
  };

  const handleCompare = () => {
    if (!productA.trim() || !productB.trim()) {
      setCompareError('Paste both ingredient lists to compare.');
      return;
    }
    setCompareError(null);

    const resA = classifyProduct({
      ingredientsText: productA,
      source: 'LINK_MANUAL'
    });

    const resB = classifyProduct({
      ingredientsText: productB,
      source: 'LINK_MANUAL'
    });

    // Comparison Logic
    const countA = (resA.triggers || []).length;
    const countB = (resB.triggers || []).length;

    let rec = 'Similar risk';
    if (countA < countB) {
      rec = 'Recommendation: Product A (Fewer detected sugar sources)';
    } else if (countB < countA) {
      rec = 'Recommendation: Product B (Fewer detected sugar sources)';
    } else {
      // Tie-breaker: Confidence
      if (resA.confidence > resB.confidence) {
        rec = 'Recommendation: Product A (Higher analysis confidence)';
      } else if (resB.confidence > resA.confidence) {
        rec = 'Recommendation: Product B (Higher analysis confidence)';
      }
    }

    setComparisonResult({
      resultA: resA,
      resultB: resB,
      recommendation: rec
    });
  };

  return (
    <div className="min-h-screen sugar-bg text-ink pb-24">
      <TopHeader />

      <main className="max-w-xl mx-auto px-4 py-6 space-y-6">
        <Onboarding />

        {/* Real Failure Story (Why this matters) */}
        <div className="bg-cocoa/5 border border-cocoa/10 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-cocoa mb-2">A real example (why this matters)</h3>
          <p className="text-xs text-zinc-600 leading-relaxed space-y-2">
            Some products don’t list the word ‘sugar’ directly.
            <br />
            Example: a chocolate product included ‘corn syrup solids’ instead.
            <br />
            A keyword-only check would miss it (false negative).
            <br />
            SugarShield flags this via hidden-sugar triggers and explains why.
            <br />
            The product is intentionally conservative to reduce missed sugar detection.
          </p>
        </div>

        {/* Why SugarShield Exists */}
        <div className="bg-white border border-black/5 rounded-2xl p-4 shadow-sm">
          <h3 className="text-sm font-bold text-ink mb-1">Why SugarShield Exists</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">
            Food labels often hide sugar under multiple names. Missing sugar is riskier than over-flagging it. SugarShield is intentionally conservative to minimize false negatives and help people make safer everyday food choices.
          </p>
        </div>

        <DisclaimerCard />

        <div className="space-y-6">
          <div className="flex items-center justify-between px-1">
            <SegmentedTabs activeTab={activeTab} onChange={handleTabChange} />

            {/* Demo Mode Toggle */}
            <button
              onClick={handleDemoToggle}
              className={`ml-2 flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${demoMode ? 'bg-cocoa text-white border-cocoa' : 'bg-white text-zinc-400 border-black/5'}`}
            >
              <span className={`w-2 h-2 rounded-full ${demoMode ? 'bg-emerald-400' : 'bg-zinc-300'}`} />
              Demo Mode
            </button>
          </div>

          {/* Examples - Only show when no result is present, to keep UI clean */}
          {!result && <ExamplesStrip onSelect={handleResult} />}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <div className="bg-paper rounded-3xl shadow-sm border border-black/5 overflow-hidden">
                {activeTab === 'scan' && <ScanTab onResult={handleResult} demoMode={demoMode} />}
                {activeTab === 'upload' && <UploadTab onResult={handleResult} />}
                {activeTab === 'link' && <LinkTab onResult={handleResult} demoMode={demoMode} />}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', bounce: 0.4 }}
            >
              <ResultCard result={result} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Compare Products Section */}
        <section className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm space-y-4">
          <div className="text-center mb-2">
            <h3 className="text-lg font-bold text-ink">Compare Products</h3>
            <p className="text-xs text-zinc-500">Paste ingredients to see which is safer.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <textarea
              className="w-full text-xs p-3 rounded-xl bg-subtle border border-black/5 resize-none focus:ring-1 focus:ring-cocoa/50 outline-none"
              rows={4}
              placeholder="Paste ingredients for Product A..."
              value={productA}
              onChange={(e) => setProductA(e.target.value)}
            />
            <textarea
              className="w-full text-xs p-3 rounded-xl bg-subtle border border-black/5 resize-none focus:ring-1 focus:ring-cocoa/50 outline-none"
              rows={4}
              placeholder="Paste ingredients for Product B..."
              value={productB}
              onChange={(e) => setProductB(e.target.value)}
            />
          </div>

          {compareError && (
            <p className="text-xs text-red-500 text-center font-medium">{compareError}</p>
          )}

          <button
            onClick={handleCompare}
            className="w-full py-3 bg-ink text-white rounded-xl font-bold text-sm hover:bg-ink/90 transition-all shadow-sm"
          >
            Compare
          </button>

          {comparisonResult && (
            <div className="mt-6 space-y-4 animate-in fade-in slide-in-from-bottom-2">
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                <p className="text-sm font-bold text-emerald-800">{comparisonResult.recommendation}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Result A */}
                <div className="bg-paper p-3 rounded-xl border border-black/5 text-xs">
                  <p className="font-bold text-center mb-2 text-ink">Product A</p>
                  <p className={`text-[10px] font-bold uppercase mb-1 ${comparisonResult.resultA.verdict === 'PASS' ? 'text-emerald-600' :
                    comparisonResult.resultA.verdict === 'FAIL' ? 'text-red-600' : 'text-amber-600'
                    }`}>
                    {comparisonResult.resultA.verdict === 'PASS' ? 'No Added Sugar' :
                      comparisonResult.resultA.verdict === 'FAIL' ? 'High Sugar Risk' : 'Potential Risk'}
                  </p>
                  <p className="text-[10px] text-zinc-400 mb-2">
                    Confidence: {Math.round(comparisonResult.resultA.confidence * 100)}% ({comparisonResult.resultA.confidence_label})
                  </p>
                  <ul className="space-y-1">
                    {(comparisonResult.resultA.triggers || []).slice(0, 3).map((t, i) => (
                      <li key={i} className="text-[10px] bg-cocoa/5 rounded px-1.5 py-0.5 text-zinc-600">
                        {t.term}
                      </li>
                    ))}
                    {(comparisonResult.resultA.triggers || []).length === 0 && (
                      <li className="text-[10px] text-zinc-400 italic">No triggers</li>
                    )}
                  </ul>
                </div>

                {/* Result B */}
                <div className="bg-paper p-3 rounded-xl border border-black/5 text-xs">
                  <p className="font-bold text-center mb-2 text-ink">Product B</p>
                  <p className={`text-[10px] font-bold uppercase mb-1 ${comparisonResult.resultB.verdict === 'PASS' ? 'text-emerald-600' :
                    comparisonResult.resultB.verdict === 'FAIL' ? 'text-red-600' : 'text-amber-600'
                    }`}>
                    {comparisonResult.resultB.verdict === 'PASS' ? 'No Added Sugar' :
                      comparisonResult.resultB.verdict === 'FAIL' ? 'High Sugar Risk' : 'Potential Risk'}
                  </p>
                  <p className="text-[10px] text-zinc-400 mb-2">
                    Confidence: {Math.round(comparisonResult.resultB.confidence * 100)}% ({comparisonResult.resultB.confidence_label})
                  </p>
                  <ul className="space-y-1">
                    {(comparisonResult.resultB.triggers || []).slice(0, 3).map((t, i) => (
                      <li key={i} className="text-[10px] bg-cocoa/5 rounded px-1.5 py-0.5 text-zinc-600">
                        {t.term}
                      </li>
                    ))}
                    {(comparisonResult.resultB.triggers || []).length === 0 && (
                      <li className="text-[10px] text-zinc-400 italic">No triggers</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Story Section */}
        <div className="pt-12 pb-6 border-t border-black/5 space-y-12">

          {/* How it works */}
          <section className="space-y-6">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest text-center">How it Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="p-4 bg-white/50 rounded-2xl border border-black/5">
                <div className="text-2xl mb-2">📸</div>
                <p className="text-sm font-bold text-ink mb-1">1. Capture</p>
                <p className="text-xs text-zinc-500">Scan a barcode, upload a label, or paste a link.</p>
              </div>
              <div className="p-4 bg-white/50 rounded-2xl border border-black/5">
                <div className="text-2xl mb-2">🧠</div>
                <p className="text-sm font-bold text-ink mb-1">2. Extract</p>
                <p className="text-xs text-zinc-500">Vision AI reads the ingredients list instantly.</p>
              </div>
              <div className="p-4 bg-white/50 rounded-2xl border border-black/5">
                <div className="text-2xl mb-2">🛡️</div>
                <p className="text-sm font-bold text-ink mb-1">3. Evaluate</p>
                <p className="text-xs text-zinc-500">Get a PASS/WARN/FAIL verdict with confidence score.</p>
              </div>
            </div>
          </section>

          {/* Accuracy & Limits */}
          <section className="bg-paper p-6 rounded-3xl border border-black/5 text-center space-y-3">
            <h3 className="text-sm font-bold text-ink">Accuracy & Limits</h3>
            <p className="text-xs text-zinc-500 leading-relaxed max-w-xl mx-auto">
              SugarShield is an early MVP and uses best-effort text parsing. It is not perfect and may miss unconventional labeling.
              Always verify important dietary decisions with the physical label. We continuously improve our model based on real-world tests.
            </p>
            <div>
              <Link href="/eval" className="text-xs font-semibold text-cocoa hover:underline">
                View Model Evaluation →
              </Link>
            </div>
          </section>

          {/* Footer */}
          <footer className="text-center pb-8 pt-4">
            <p className="text-[10px] text-zinc-300">
              Not medical advice. Ingredient extraction from URLs may be incomplete. Results depend on input quality.
            </p>
          </footer>

        </div>
      </main>
    </div>
  );
}
