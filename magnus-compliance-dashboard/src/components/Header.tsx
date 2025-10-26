'use client';

import { motion } from 'framer-motion';

export default function Header() {
  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 z-30">
      <div className="flex items-center justify-between h-full px-6">
        {/* Search */}
        <motion.div
          className="flex-1 max-w-xl"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <input
            type="search"
            placeholder="Search compliance data..."
            className="w-full px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 focus:outline-none focus:ring-2 focus:ring-brand"
          />
        </motion.div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          <motion.button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            🔔
          </motion.button>
          <motion.button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-900 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            ⚙️
          </motion.button>
          <motion.div
            className="w-10 h-10 rounded-full bg-brand flex items-center justify-center text-white font-bold"
            whileHover={{ scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            M
          </motion.div>
        </div>
      </div>
    </header>
  );
}
