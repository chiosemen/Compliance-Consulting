'use client';

import { motion } from 'framer-motion';

export interface LoaderProps {
  variant?: 'default' | 'card' | 'inline' | 'fullscreen';
  text?: string;
}

export default function Loader({ variant = 'default', text }: LoaderProps) {
  if (variant === 'fullscreen') {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-brand-dark/95 backdrop-blur-sm z-50">
        <div className="text-center">
          <ShimmerSpinner />
          {text && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-white/60"
            >
              {text}
            </motion.p>
          )}
        </div>
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 animate-pulse">
        <div className="space-y-4">
          {/* Header shimmer */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-white/10 rounded-lg w-3/4 shimmer"></div>
              <div className="h-4 bg-white/10 rounded-lg w-1/2 shimmer"></div>
            </div>
            <div className="h-8 w-20 bg-white/10 rounded-full shimmer"></div>
          </div>

          {/* Content shimmer */}
          <div className="space-y-2">
            <div className="h-4 bg-white/10 rounded-lg w-full shimmer"></div>
            <div className="h-4 bg-white/10 rounded-lg w-5/6 shimmer"></div>
          </div>

          {/* Tags shimmer */}
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-white/10 rounded-full shimmer"></div>
            <div className="h-6 w-20 bg-white/10 rounded-full shimmer"></div>
            <div className="h-6 w-14 bg-white/10 rounded-full shimmer"></div>
          </div>

          {/* Footer shimmer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <div className="h-3 w-24 bg-white/10 rounded shimmer"></div>
            <div className="h-4 w-20 bg-white/10 rounded shimmer"></div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2">
        <div className="flex space-x-1">
          <motion.div
            className="w-2 h-2 bg-brand rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0 }}
          />
          <motion.div
            className="w-2 h-2 bg-brand rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.2 }}
          />
          <motion.div
            className="w-2 h-2 bg-brand rounded-full"
            animate={{ scale: [1, 1.2, 1], opacity: [1, 0.5, 1] }}
            transition={{ duration: 0.8, repeat: Infinity, delay: 0.4 }}
          />
        </div>
        {text && <span className="text-sm text-white/60">{text}</span>}
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex justify-center items-center p-8">
      <ShimmerSpinner />
    </div>
  );
}

function ShimmerSpinner() {
  return (
    <div className="relative w-16 h-16">
      <motion.div
        className="absolute inset-0 border-4 border-brand/20 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-0 border-4 border-transparent border-t-brand rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-2 bg-brand/10 rounded-full shimmer"
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </div>
  );
}

// Add shimmer animation to globals.css
export const shimmerKeyframes = `
@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.shimmer {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}
`;
