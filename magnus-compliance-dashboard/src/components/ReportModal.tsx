'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

export interface ReportData {
  id: string;
  title: string;
  organization: string;
  date: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  summary: string;
  details: {
    section: string;
    content: string;
  }[];
  metrics?: {
    label: string;
    value: string | number;
    trend?: 'up' | 'down' | 'stable';
  }[];
  recommendations?: string[];
}

export interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: ReportData | null;
}

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

const contentVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.3,
    },
  }),
};

const riskColors = {
  low: 'text-green-400',
  medium: 'text-yellow-400',
  high: 'text-orange-400',
  critical: 'text-red-400',
};

const trendIcons = {
  up: '↗',
  down: '↘',
  stable: '→',
};

const trendColors = {
  up: 'text-green-400',
  down: 'text-red-400',
  stable: 'text-white/60',
};

export default function ReportModal({
  isOpen,
  onClose,
  report,
}: ReportModalProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!report) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-4xl max-h-[90vh] bg-brand-dark border border-brand/30 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-brand-dark/95 backdrop-blur-sm border-b border-white/10 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <motion.h2
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="text-2xl font-bold text-white mb-2"
                  >
                    {report.title}
                  </motion.h2>
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-center gap-3 text-sm text-white/60"
                  >
                    <span>{report.organization}</span>
                    <span>•</span>
                    <span>{report.date}</span>
                    <span>•</span>
                    <span className={`font-semibold ${riskColors[report.riskLevel]}`}>
                      {report.riskLevel.toUpperCase()} RISK
                    </span>
                  </motion.div>
                </div>

                {/* Close Button */}
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                >
                  ✕
                </motion.button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto max-h-[calc(90vh-120px)] p-6 space-y-6">
              {/* Summary */}
              <motion.section
                custom={0}
                variants={contentVariants}
                initial="hidden"
                animate="visible"
                className="bg-white/5 rounded-xl p-6 border border-white/10"
              >
                <h3 className="text-lg font-semibold text-white mb-3">
                  Executive Summary
                </h3>
                <p className="text-white/70 leading-relaxed">{report.summary}</p>
              </motion.section>

              {/* Metrics */}
              {report.metrics && report.metrics.length > 0 && (
                <motion.section
                  custom={1}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 md:grid-cols-4 gap-4"
                >
                  {report.metrics.map((metric, index) => (
                    <motion.div
                      key={index}
                      whileHover={{ y: -2 }}
                      className="bg-white/5 rounded-xl p-4 border border-white/10"
                    >
                      <p className="text-xs text-white/50 mb-1">{metric.label}</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-brand">
                          {metric.value}
                        </p>
                        {metric.trend && (
                          <span className={`text-sm ${trendColors[metric.trend]}`}>
                            {trendIcons[metric.trend]}
                          </span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </motion.section>
              )}

              {/* Details */}
              {report.details && report.details.length > 0 && (
                <motion.section
                  custom={2}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  className="space-y-4"
                >
                  <h3 className="text-lg font-semibold text-white">
                    Detailed Analysis
                  </h3>
                  {report.details.map((detail, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="bg-white/5 rounded-xl p-6 border border-white/10"
                    >
                      <h4 className="text-md font-semibold text-brand mb-3">
                        {detail.section}
                      </h4>
                      <p className="text-white/70 leading-relaxed">
                        {detail.content}
                      </p>
                    </motion.div>
                  ))}
                </motion.section>
              )}

              {/* Recommendations */}
              {report.recommendations && report.recommendations.length > 0 && (
                <motion.section
                  custom={3}
                  variants={contentVariants}
                  initial="hidden"
                  animate="visible"
                  className="bg-brand/10 rounded-xl p-6 border border-brand/30"
                >
                  <h3 className="text-lg font-semibold text-white mb-4">
                    Recommendations
                  </h3>
                  <ul className="space-y-3">
                    {report.recommendations.map((rec, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.1 }}
                        className="flex items-start gap-3"
                      >
                        <span className="text-brand mt-1">✓</span>
                        <span className="text-white/80 flex-1">{rec}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.section>
              )}
            </div>

            {/* Footer */}
            <div className="sticky bottom-0 bg-brand-dark/95 backdrop-blur-sm border-t border-white/10 p-6">
              <div className="flex justify-end gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  className="px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white rounded-lg border border-white/10 transition-colors"
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-2.5 bg-brand hover:bg-brand/90 text-white rounded-lg transition-colors font-medium"
                >
                  Export Report
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
