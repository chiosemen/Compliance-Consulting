
"use client";
import { motion } from "framer-motion";
export default function HeaderBar(){
  return (
    <motion.header initial={{opacity:0}} animate={{opacity:1}} className="sticky top-0 z-40 backdrop-blur border-b border-slate-200/60 dark:border-slate-800 bg-white/60 dark:bg-slate-950/60">
      <div className="container flex items-center justify-between h-14">
        <div className="font-semibold">Overview</div>
        <div className="flex gap-2">
          <button className="btn">Generate Report</button>
        </div>
      </div>
    </motion.header>
  );
}
