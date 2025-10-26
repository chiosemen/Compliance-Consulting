
"use client";
import Link from "next/link";
import { motion } from "@/lib/lazy-motion";
export default function Sidebar(){
  const items = [
    { href: "/", label: "Dashboard" },
    { href: "/orgs", label: "Organizations" },
    { href: "/alerts", label: "Alerts" },
    { href: "/admin", label: "Admin" },
  ];
  return (
    <aside className="sticky top-0 h-screen w-64 border-r border-slate-200/60 dark:border-slate-800 p-4 hidden md:block">
      <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.35}}>
        <div className="mb-6">
          <Link href="/" className="text-2xl font-bold">MCC<span className="text-brand"> •</span></Link>
          <p className="text-sm text-slate-500 dark:text-slate-400">Compliance Intelligence</p>
        </div>
        <nav className="space-y-2">
          {items.map(it => (
            <Link key={it.href} href={it.href} className="block px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800">
              {it.label}
            </Link>
          ))}
        </nav>
      </motion.div>
    </aside>
  );
}
