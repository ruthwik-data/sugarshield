'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { getAnalytics, resetAnalytics } from '@/lib/analytics';
import { AnalyticsData } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function MetricsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = () => {
    const data = getAnalytics();
    setAnalytics(data);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all analytics data?')) {
      resetAnalytics();
      loadAnalytics();
    }
  };

  if (!analytics) {
    return <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <p className="text-zinc-400">Loading...</p>
    </div>;
  }

  const totalScans = analytics.scans_count + analytics.uploads_count + analytics.link_pastes_count;
  const totalVerdicts = analytics.verdicts.pass + analytics.verdicts.warn + analytics.verdicts.fail;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="border-b border-white/10 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-3 py-1.5 text-sm rounded-lg bg-zinc-800/50 border border-white/10 hover:bg-zinc-800 transition-colors"
              >
                ← Back
              </motion.button>
            </Link>
            <h1 className="text-xl font-bold">Analytics & Metrics</h1>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-lg font-semibold hover:bg-red-500/30 transition-colors text-sm"
          >
            Reset Data
          </motion.button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-4">Usage Statistics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
              <p className="text-sm text-zinc-400 mb-1">Barcode Scans</p>
              <p className="text-3xl font-bold text-blue-400">{analytics.scans_count}</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
              <p className="text-sm text-zinc-400 mb-1">Image Uploads</p>
              <p className="text-3xl font-bold text-purple-400">{analytics.uploads_count}</p>
            </div>
            <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
              <p className="text-sm text-zinc-400 mb-1">Link Pastes</p>
              <p className="text-3xl font-bold text-pink-400">{analytics.link_pastes_count}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold mb-4">Verdict Distribution</h2>
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6">
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-emerald-300">PASS</span>
                  <span className="text-sm text-zinc-400">
                    {analytics.verdicts.pass} ({totalVerdicts > 0 ? ((analytics.verdicts.pass / totalVerdicts) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${totalVerdicts > 0 ? (analytics.verdicts.pass / totalVerdicts) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-amber-300">WARN</span>
                  <span className="text-sm text-zinc-400">
                    {analytics.verdicts.warn} ({totalVerdicts > 0 ? ((analytics.verdicts.warn / totalVerdicts) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${totalVerdicts > 0 ? (analytics.verdicts.warn / totalVerdicts) * 100 : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-red-300">FAIL</span>
                  <span className="text-sm text-zinc-400">
                    {analytics.verdicts.fail} ({totalVerdicts > 0 ? ((analytics.verdicts.fail / totalVerdicts) * 100).toFixed(1) : 0}%)
                  </span>
                </div>
                <div className="h-3 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full transition-all duration-500"
                    style={{ width: `${totalVerdicts > 0 ? (analytics.verdicts.fail / totalVerdicts) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="bg-zinc-900/50 border border-white/5 rounded-2xl overflow-hidden">
            {analytics.recent.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                No activity yet
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {analytics.recent.map((event, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 hover:bg-zinc-800/30 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {event.mode === 'scan' ? '📷' : event.mode === 'upload' ? '📤' : '🔗'}
                        </span>
                        <div>
                          <p className="text-sm font-semibold capitalize">{event.mode}</p>
                          <p className="text-xs text-zinc-500">{formatDate(event.timestamp)}</p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-sm font-semibold ${
                        event.verdict === 'PASS' ? 'bg-emerald-500/20 text-emerald-300' :
                        event.verdict === 'WARN' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-red-500/20 text-red-300'
                      }`}>
                        {event.verdict}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-8 bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
        >
          <div className="flex items-start gap-2">
            <span className="text-sm">🔒</span>
            <div>
              <h3 className="text-sm font-semibold text-blue-200 mb-1">Privacy-Friendly Analytics</h3>
              <p className="text-xs text-blue-100/80">
                All analytics are stored locally in your browser only. No data is sent to any server.
                Clearing your browser data will reset these metrics.
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}
