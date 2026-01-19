import { motion } from 'framer-motion';

export default function DisclaimerCard() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-cream border border-cocoa/10 rounded-2xl p-4 shadow-sm mb-6"
        >
            <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-full bg-cocoa/10 flex items-center justify-center text-xs mt-0.5 shrink-0 text-cocoa">
                    !
                </div>
                <p className="text-sm text-zinc-600 leading-relaxed">
                    <span className="font-semibold text-cocoa">Medical Disclaimer:</span> SugarShield is for informational purposes only. Always consult a healthcare professional for dietary advice.
                </p>
            </div>
        </motion.div>
    );
}
