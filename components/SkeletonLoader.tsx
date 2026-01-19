import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  message?: string;
}

export default function SkeletonLoader({ message = 'Loading...' }: SkeletonLoaderProps) {
  return (
    <div className="bg-zinc-900/50 border border-white/5 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full"
        />
        <p className="text-sm text-zinc-400">{message}</p>
      </div>

      <div className="space-y-3">
        <div className="h-12 shimmer rounded-xl" />
        <div className="h-8 shimmer rounded-xl w-3/4" />
        <div className="h-8 shimmer rounded-xl w-1/2" />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-6">
        <div className="h-20 shimmer rounded-xl" />
        <div className="h-20 shimmer rounded-xl" />
      </div>
    </div>
  );
}
