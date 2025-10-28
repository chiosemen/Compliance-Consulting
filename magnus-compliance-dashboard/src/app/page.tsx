'use client';

import { motion } from '@/lib/lazy-motion';

export default function Home() {
  return (
    <div className="p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl"
      >
        <motion.h1
          className="text-5xl font-bold mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <span className="text-brand">Hello</span>{' '}
          <span className="text-foreground">MCC Dashboard</span>
        </motion.h1>

        <motion.p
          className="text-xl text-foreground/70 mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          Welcome to Magnus Compliance Consulting&apos;s AI-powered compliance intelligence platform.
        </motion.p>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
        >
          <motion.div
            className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm"
            whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(22, 163, 74, 0.1)' }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="text-3xl mb-3">🏢</div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Organizations</h3>
            <p className="text-sm text-foreground/60">
              Manage compliance across your organization
            </p>
          </motion.div>

          <motion.div
            className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm"
            whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(22, 163, 74, 0.1)' }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="text-3xl mb-3">📊</div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">Reports</h3>
            <p className="text-sm text-foreground/60">
              Generate comprehensive compliance reports
            </p>
          </motion.div>

          <motion.div
            className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm"
            whileHover={{ scale: 1.05, boxShadow: '0 10px 25px rgba(22, 163, 74, 0.1)' }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <div className="text-3xl mb-3">🤖</div>
            <h3 className="text-lg font-semibold mb-2 text-foreground">AI Insights</h3>
            <p className="text-sm text-foreground/60">
              Powered by intelligent compliance analytics
            </p>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}
