
"use client";
import HeaderBar from "@/components/HeaderBar";
import FeedCard from "@/components/FeedCard";
import { useState } from "react";
import ModalViewer from "@/components/ModalViewer";

export default function Page(){
  const [open, setOpen] = useState(false);
  const data = [
    { name: "AI for the People", score: 78, risk: "Medium" as const },
    { name: "Example Arts Org", score: 64, risk: "High" as const },
    { name: "Civic Media Lab", score: 86, risk: "Low" as const }
  ];
  return (
    <div>
      <HeaderBar />
      <div className="container py-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {data.map((org, i) => (
            <div key={i} onClick={() => setOpen(true)} className="cursor-pointer">
              <FeedCard org={org} />
            </div>
          ))}
        </div>
      </div>
      <ModalViewer open={open} onClose={() => setOpen(false)}>
        <div className="aspect-video w-full bg-slate-100 dark:bg-slate-800 rounded-xl grid place-items-center">
          <span className="text-sm text-slate-500">PDF preview placeholder</span>
        </div>
      </ModalViewer>
    </div>
  )
}
