
"use client";
import { motion, AnimatePresence } from "framer-motion";
export default function ModalViewer({ open, onClose, children }:{ open:boolean; onClose:()=>void; children:React.ReactNode }){
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
          <motion.div initial={{scale:0.95, opacity:0}} animate={{scale:1, opacity:1}} exit={{scale:0.95, opacity:0}} transition={{duration:0.2}} className="w-full max-w-3xl card p-4">
            <div className="flex justify-end">
              <button onClick={onClose} className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">Close</button>
            </div>
            <div className="mt-2">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
