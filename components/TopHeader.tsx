import { motion } from 'framer-motion';
import Link from 'next/link';
import { useState } from 'react';
import SettingsDrawer from './SettingsDrawer';

export default function TopHeader() {
    const [settingsOpen, setSettingsOpen] = useState(false);

    return (
        <>
            <header className="sticky top-0 z-40 w-full bg-cream/80 backdrop-blur-md border-b border-black/5">
                <div className="max-w-xl mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-cocoa flex items-center justify-center text-white text-lg shadow-sm">
                            🛡️
                        </div>
                        <h1 className="text-lg font-bold text-ink tracking-tight">SugarShield</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <Link href="/eval">
                            <button className="px-3 py-1.5 text-xs font-semibold text-cocoa bg-paper border border-black/10 rounded-full shadow-sm hover:bg-white transition-all active:scale-95">
                                Eval
                            </button>
                        </Link>

                        <button
                            onClick={() => setSettingsOpen(true)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-paper border border-black/10 shadow-sm text-sm hover:bg-white transition-all active:scale-95 text-ink"
                        >
                            ⚙️
                        </button>
                    </div>
                </div>
            </header>

            <SettingsDrawer isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        </>
    );
}
