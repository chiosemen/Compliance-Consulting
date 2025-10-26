
"use client";
import { motion } from "framer-motion";
type Props = { org: { name:string; score:number; risk: "Low"|"Medium"|"High" } };
export default function FeedCard({ org }: Props){
  return (
    <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} transition={{duration:0.25}} className="card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{org.name}</h3>
        <span className="text-sm px-2 py-1 rounded-full bg-slate-100 dark:bg-slate-800">{org.risk} Risk</span>
      </div>
      <p className="text-sm text-slate-500 mt-2">Compliance Score</p>
      <div className="mt-1 text-3xl font-bold">{org.score}</div>
      <div className="mt-3"><button className="link">Open Report →</button></div>
    </motion.div>
  );
}
