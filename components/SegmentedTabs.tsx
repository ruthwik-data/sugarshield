import { motion } from 'framer-motion';

type Tab = 'scan' | 'upload' | 'link';

interface SegmentedTabsProps {
    activeTab: Tab;
    onChange: (tab: Tab) => void;
}

export default function SegmentedTabs({ activeTab, onChange }: SegmentedTabsProps) {
    const tabs: { id: Tab; label: string; icon: string }[] = [
        { id: 'scan', label: 'Scan', icon: '📷' },
        { id: 'upload', label: 'Upload', icon: '📤' },
        { id: 'link', label: 'Link', icon: '🔗' },
    ];

    return (
        <div className="w-full bg-black/5 p-1 rounded-xl flex relative">
            <motion.div
                className="absolute top-1 bottom-1 bg-paper rounded-lg shadow-sm z-0"
                initial={false}
                animate={{
                    left: `${(tabs.findIndex(t => t.id === activeTab) / tabs.length) * 100}%`,
                    width: `${100 / tabs.length}%`,
                    x: tabs.findIndex(t => t.id === activeTab) === 0 ? 4 : tabs.findIndex(t => t.id === activeTab) === tabs.length - 1 ? -4 : 0
                }}
            // Adjust widths slightly for padding if needed, but simple % is usually fine with slight margin tweaks.
            // Actually, let's use layoutId for cleaner animation if items are equal width.
            // Re-doing with layoutId approach for "Apple-style" snap.
            />
            {/* Alternative implementation for perfect Apple style: using layoutId on the background */}
            <div className="absolute inset-1 flex pointer-events-none">
                {/* This is a bit complex for absolute positioning, let's stick to the mapped background approach */}
            </div>

            {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`
              relative flex-1 py-1.5 text-sm font-medium z-10 transition-all duration-200
              flex items-center justify-center gap-1.5 active:scale-95 hover:-translate-y-px
              ${isActive ? 'text-ink' : 'text-zinc-500 hover:text-zinc-700'}
            `}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="activeSegment"
                                className="absolute inset-0 bg-paper rounded-lg shadow-sm -z-10"
                                transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                            />
                        )}
                        <span className="text-base">{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
}
