'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from '@/lib/lazy-motion';

const navItems = [
  { href: '/', label: 'Dashboard', icon: '🏠' },
  { href: '/orgs/demo', label: 'Organizations', icon: '🏢' },
  { href: '/reports/demo', label: 'Reports', icon: '📊' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-brand-dark border-r border-brand/20 z-40">
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="p-6 border-b border-brand/20">
          <Link href="/">
            <motion.h1
              className="text-2xl font-bold text-brand"
              whileHover={{ scale: 1.05 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              MCC
            </motion.h1>
          </Link>
          <p className="text-xs text-white/60 mt-1">Compliance Intelligence</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <motion.div
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-brand text-white'
                          : 'text-white/70 hover:bg-white/10 hover:text-white'
                      }`}
                      whileHover={{ x: 4 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <span className="text-xl">{item.icon}</span>
                      <span className="font-medium">{item.label}</span>
                    </motion.div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-brand/20">
          <div className="text-xs text-white/40">
            <p>Magnus Compliance</p>
            <p>Version 1.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
