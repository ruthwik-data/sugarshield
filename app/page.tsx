'use client';

import { useState } from 'react';
import Link from 'next/link';
import ScanTab from '@/components/ScanTab';
import UploadTab from '@/components/UploadTab';
import LinkTab from '@/components/LinkTab';
import ResultCard from '@/components/ResultCard';
import TopHeader from '@/components/TopHeader';
import SegmentedTabs from '@/components/SegmentedTabs';
import DisclaimerCard from '@/components/DisclaimerCard';
import ExamplesStrip from '@/components/ExamplesStrip';
import Onboarding from '@/components/Onboarding';
import { ClassificationResult } from '@/lib/types';

type Tab = 'scan' | 'upload' | 'link';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('scan');
  const [result, setResult] = useState<ClassificationResult | null>(null);

  return (
    <div className="min-h-screen sugar-bg text-ink pb-24">
      <TopHeader />

      <main className="max-w-xl mx-auto px-4 py-8 space-y-6">

        <Onboarding />

        {/* HERO */}
        <section className="bg-white border border-zinc-100 rounded-2xl p-5 shadow-sm space-y-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">The problem</p>
          <p className="text-sm text-zinc-500 leading-relaxed">
            Food labels often hide sugar under dozens of ingredient names — maltodextrin, dextrose, cane juice, rice syrup, and more.
          </p>

          <h1 className="text-3xl md:text-4xl font-semibold leading-tight text-zinc-900">
            Scan food. Instantly know if it's safe for your sugar levels.
          </h1>

          <p className="text-base text-zinc-600 leading-relaxed">
            Scan food and get a decision in 3 seconds — so you can avoid accidentally buying products with hidden sugar.
          </p>

          <div>
            <h3 className="text-sm font-semibold text-zinc-700 mb-2">Who this is for</h3>
            <ul className="text-sm text-zinc-500 list-disc pl-5 space-y-1">
              <li>Parents choosing snacks for kids</li>
              <li>People managing pre-diabetes or diabetes</li>
              <li>Fitness-focused shoppers tracking sugar intake</li>
            </ul>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-zinc-700 mb-1">Our product decision</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              We intentionally over-warn rather than miss hidden sugar, because false negatives are riskier for our users than a false alarm.
            </p>
          </div>

          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-zinc-700 mb-1">Model Evaluation</h3>
            <p className="text-sm text-zinc-500 leading-relaxed">
              0 false negatives on our current test set. Built to minimize missed hidden sugars.
            </p>
            <Link href="/eval" className="text-xs font-semibold text-emerald-700 hover:underline mt-1 inline-block">
              View evaluation →
            </Link>
          </div>
        </section>

        <DisclaimerCard />

        {/* TOOL */}
        <div className="space-y-4">
          <SegmentedTabs activeTab={activeTab} onChange={setActiveTab} />

          {!result && <ExamplesStrip onSelect={setResult} />}

          <div className="bg-white rounded-2xl border border-zinc-100 p-4 shadow-sm">
            {activeTab === 'scan' && <ScanTab onResult={setResult} />}
            {activeTab === 'upload' && <UploadTab onResult={setResult} />}
            {activeTab === 'link' && <LinkTab onResult={setResult} />}
          </div>
        </div>

        {result && <ResultCard result={result} />}

        <div className="border-t border-zinc-100 my-6" />

        {/* HOW IT WORKS */}
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-zinc-700">How it works</h3>
          <ol className="text-sm text-zinc-500 list-decimal pl-5 space-y-1">
            <li>Scan or input a product</li>
            <li>Analyze ingredients and nutrition data</li>
            <li>Get a clear Safe / Caution / Avoid decision</li>
          </ol>
        </section>

        <section className="bg-zinc-50 border border-zinc-100 rounded-xl p-4">
          <p className="text-sm text-zinc-500 leading-relaxed">
            Example: A product listed "corn syrup solids" instead of sugar.
            A keyword-based system would miss it. SugarShield flags this as hidden sugar risk.
          </p>
        </section>

      </main>
    </div>
  );
}
