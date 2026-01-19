'use client';

import { motion } from 'framer-motion';
import { ClassificationResult } from '@/lib/types';

interface ExamplesStripProps {
    onSelect: (result: ClassificationResult) => void;
}

export default function ExamplesStrip({ onSelect }: ExamplesStripProps) {
    const examples = [
        {
            id: 'cola',
            label: 'Cola Can',
            icon: '🥤',
            result: {
                classification: 'FAIL',
                verdict: 'FAIL',
                confidence: 0.98,
                reasons: [
                    'High Fructose Corn Syrup detected at top of list',
                    'Contains 39g added sugar per can',
                    'No fiber content'
                ],
                matchedTerms: [
                    { term: 'High Fructose Corn Syrup', type: 'added_sugar' },
                    { term: 'Sugar', type: 'added_sugar' }
                ],
                notes: 'Example: A typical soda can analysis.'
            }
        },
        {
            id: 'cookies',
            label: 'Oat Cookies',
            icon: '🍪',
            result: {
                classification: 'WARN',
                verdict: 'WARN',
                confidence: 0.85,
                reasons: [
                    'Contains "Brown Rice Syrup" (hidden sugar)',
                    'Raisins contribute to total sugar count',
                    'Moderate sugar content overall'
                ],
                matchedTerms: [
                    { term: 'Brown Rice Syrup', type: 'hidden_sugar' }
                ],
                notes: 'Example: "Healthy" cookies often contain alternative syrups.'
            }
        },
        {
            id: 'yogurt',
            label: 'Greek Yogurt',
            icon: '🥣',
            result: {
                classification: 'PASS',
                verdict: 'PASS',
                confidence: 0.92,
                reasons: [
                    'No added sugars found in ingredient list',
                    'Contains only naturally occurring lactose',
                    'High protein content'
                ],
                matchedTerms: [],
                notes: 'Example: Plain dairy products usually pass check.'
            }
        }
    ];

    return (
        <div className="py-4 border-t border-black/5">
            <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-3 px-1">
                Try Examples
            </h3>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {examples.map((ex) => (
                    <motion.button
                        key={ex.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => onSelect(ex.result as any)}
                        className="flex items-center gap-2.5 px-3 py-2 bg-paper border border-black/5 rounded-xl shadow-sm hover:shadow-md transition-all shrink-0"
                    >
                        <span className="text-lg">{ex.icon}</span>
                        <span className="text-sm font-medium text-ink">{ex.label}</span>
                    </motion.button>
                ))}
            </div>
        </div>
    );
}
