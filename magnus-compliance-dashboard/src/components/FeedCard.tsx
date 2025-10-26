'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export interface FeedCardProps {
  id: string;
  title: string;
  organization: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  date: string;
  tags?: string[];
  amount?: number;
}

const riskColors = {
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  critical: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const riskIcons = {
  low: '✓',
  medium: '⚠',
  high: '⚠',
  critical: '⛔',
};

export default function FeedCard({
  id,
  title,
  organization,
  riskLevel,
  summary,
  date,
  tags = [],
  amount,
}: FeedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:border-brand/40 transition-colors"
    >
      <Link href={`/reports/${id}`}>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <motion.h3
                className="text-lg font-semibold text-white truncate"
                whileHover={{ x: 2 }}
              >
                {title}
              </motion.h3>
              <p className="text-sm text-white/60 mt-1">{organization}</p>
            </div>

            {/* Risk Badge */}
            <motion.div
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${riskColors[riskLevel]}`}
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <span>{riskIcons[riskLevel]}</span>
              <span className="uppercase tracking-wide">{riskLevel}</span>
            </motion.div>
          </div>

          {/* Summary */}
          <p className="text-white/70 text-sm line-clamp-2 leading-relaxed">
            {summary}
          </p>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="px-2.5 py-1 bg-brand/10 text-brand text-xs rounded-full border border-brand/20"
                >
                  {tag}
                </motion.span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/5">
            <span className="text-xs text-white/40">{date}</span>
            {amount && (
              <span className="text-sm font-semibold text-brand">
                ${amount.toLocaleString()}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
