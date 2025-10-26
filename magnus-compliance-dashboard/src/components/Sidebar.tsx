'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '🏠', badge: null },
  { href: '/orgs/demo', label: 'Organizations', icon: '🏢', badge: null },
  { href: '/reports/demo', label: 'Reports', icon: '📊', badge: 3 },
];

const containerVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0 },
};

export default function Sidebar() {
  const pathname = usePathname();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 100, damping: 20 }}
      className="fixed left-0 top-0 h-screen w-64 bg-brand-dark/95 backdrop-blur-md border-r border-brand/20 z-40 shadow-2xl"
    >
      <div className="flex flex-col h-full">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 border-b border-brand/20"
        >
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 400, damping: 17 }}
            >
              <motion.h1
                className="text-2xl font-bold text-brand"
                whileHover={{ letterSpacing: '0.05em' }}
                transition={{ duration: 0.2 }}
              >
                MCC
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs text-white/60 mt-1"
              >
                Compliance Intelligence
              </motion.p>
            </motion.div>
          </Link>
        </motion.div>

        {/* Navigation */}
        <motion.nav
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 p-4 overflow-y-auto"
        >
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
              const isHovered = hoveredItem === item.href;

              return (
                <motion.li key={item.href} variants={itemVariants}>
                  <Link href={item.href}>
                    <motion.div
                      onHoverStart={() => setHoveredItem(item.href)}
                      onHoverEnd={() => setHoveredItem(null)}
                      className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive
                          ? 'bg-brand text-white shadow-lg shadow-brand/20'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                      whileHover={{ x: 6 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                    >
                      {/* Active indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeIndicator"
                          className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}

                      {/* Icon */}
                      <motion.span
                        className="text-xl"
                        animate={{
                          scale: isActive ? 1.1 : 1,
                          rotate: isHovered ? [0, -10, 10, 0] : 0,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        {item.icon}
                      </motion.span>

                      {/* Label */}
                      <span className="font-medium flex-1">{item.label}</span>

                      {/* Badge */}
                      {item.badge && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-brand-accent text-white text-xs font-bold rounded-full"
                        >
                          {item.badge}
                        </motion.span>
                      )}

                      {/* Hover effect */}
                      {isHovered && !isActive && (
                        <motion.div
                          layoutId="hoverBackground"
                          className="absolute inset-0 bg-gradient-to-r from-brand/5 to-transparent rounded-lg"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                      )}
                    </motion.div>
                  </Link>
                </motion.li>
              );
            })}
          </ul>

          {/* Quick Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10"
          >
            <p className="text-xs text-white/40 mb-3">Quick Stats</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60">Active Orgs</span>
                <motion.span
                  whileHover={{ scale: 1.1 }}
                  className="text-sm font-bold text-brand"
                >
                  24
                </motion.span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-white/60">Pending</span>
                <motion.span
                  whileHover={{ scale: 1.1 }}
                  className="text-sm font-bold text-brand-accent"
                >
                  8
                </motion.span>
              </div>
            </div>
          </motion.div>
        </motion.nav>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-4 border-t border-brand/20"
        >
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="text-xs text-white/40 space-y-1"
          >
            <p className="font-semibold text-white/60">Magnus Compliance</p>
            <div className="flex items-center justify-between">
              <p>Version 1.0</p>
              <motion.div
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-2 h-2 bg-green-400 rounded-full"
              />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </motion.aside>
  );
}
