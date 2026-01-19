import { motion } from 'framer-motion';

export default function Disclaimer() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4"
    >
      <div className="flex items-start gap-3">
        <span className="text-xl mt-0.5">⚠️</span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-200 mb-1">
            Important Disclaimer
          </h3>
          <p className="text-xs text-amber-100/80 leading-relaxed">
            SugarShield is for <strong>informational purposes only</strong> and does not replace
            medical advice. Always consult your healthcare provider before making dietary decisions,
            especially if you have diabetes or other health conditions.
          </p>
        </div>
      </div>
    </motion.div>
  );
}
