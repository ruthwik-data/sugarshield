import { AnalyticsData, AnalyticsEvent, Verdict } from './types';

const STORAGE_KEY = 'sugarshield_analytics';

export function getAnalytics(): AnalyticsData {
  if (typeof window === 'undefined') {
    return {
      scans_count: 0,
      uploads_count: 0,
      link_pastes_count: 0,
      verdicts: { pass: 0, warn: 0, fail: 0 },
      recent: [],
    };
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return {
        scans_count: 0,
        uploads_count: 0,
        link_pastes_count: 0,
        verdicts: { pass: 0, warn: 0, fail: 0 },
        recent: [],
      };
    }
    return JSON.parse(stored);
  } catch (error) {
    console.error('Failed to load analytics:', error);
    return {
      scans_count: 0,
      uploads_count: 0,
      link_pastes_count: 0,
      verdicts: { pass: 0, warn: 0, fail: 0 },
      recent: [],
    };
  }
}

export function trackEvent(mode: 'scan' | 'upload' | 'link' | 'link_manual', verdict: Verdict): void {
  if (typeof window === 'undefined') return;

  try {
    const analytics = getAnalytics();

    if (mode === 'scan') analytics.scans_count++;
    if (mode === 'upload') analytics.uploads_count++;
    if (mode === 'link' || mode === 'link_manual') analytics.link_pastes_count++;

    if (verdict === 'PASS') analytics.verdicts.pass++;
    if (verdict === 'WARN') analytics.verdicts.warn++;
    if (verdict === 'FAIL') analytics.verdicts.fail++;

    const event: AnalyticsEvent = {
      timestamp: new Date().toISOString(),
      mode,
      verdict,
    };
    analytics.recent.unshift(event);
    analytics.recent = analytics.recent.slice(0, 10);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(analytics));
  } catch (error) {
    console.error('Failed to track event:', error);
  }
}

export function resetAnalytics(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset analytics:', error);
  }
}
