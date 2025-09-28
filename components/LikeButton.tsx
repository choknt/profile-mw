"use client";
import { useState } from "react";

export default function LikeButton({ handle, initialCount }:{ handle:string; initialCount:number }){
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggle(){
    if(loading) return;
    setLoading(true);
    const r = await fetch("/api/like/toggle", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ handle })
    });
    if(r.ok){
      const d = await r.json();
      setLiked(d.liked); setCount(d.count);
    } else {
      alert(await r.text());
    }
    setLoading(false);
  }

  return (
    <button onClick={toggle}
      className={`mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-2 ${liked ? "bg-rose-600":"bg-white/10 hover:bg-white/20"}`}>
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
        <path d="M12 21s-6.7-4.6-9.1-7.7C1.3 11.6 2 9 4.2 7.9 6 7 7.9 7.7 9 9c1.1-1.3 3-2 4.8-1.1 2.2 1.1 2.9 3.7 1.3 5.4C18.7 16.4 12 21 12 21z"
              fill="currentColor"/>
      </svg>
      <span>{liked ? "Liked":"Like"}</span>
      <span className="text-white/70">· {count}</span>
    </button>
  );
}
