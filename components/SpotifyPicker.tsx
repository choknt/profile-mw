"use client";
import { useState } from "react";

export default function SpotifyPicker({ initial, onPick }:{ initial?:string; onPick:(trackId:string)=>void }){
  const [q,setQ]=useState(""); const [items,setItems]=useState<any[]>([]);
  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search song or artist" className="flex-1 px-3 py-2 rounded bg-black/20 border border-white/20"/>
        <button onClick={async()=>{ const r=await fetch(`/api/spotify/search?q=${encodeURIComponent(q)}`); setItems(await r.json()); }} className="px-4 py-2 rounded bg-cyan-500">Search</button>
      </div>
      <ul className="space-y-2">
        {items.map(it=>(
          <li key={it.id} className="flex items-center gap-3 p-2 rounded bg-white/5 hover:bg-white/10">
            {it.cover && <img src={it.cover} className="w-12 h-12 rounded"/>}
            <div className="flex-1">
              <div className="font-medium">{it.name}</div>
              <div className="text-sm text-white/60">{it.by}</div>
            </div>
            <button onClick={()=>onPick(it.id)} className="px-3 py-1 rounded bg-cyan-500 text-sm">Select</button>
          </li>
        ))}
      </ul>
      {initial && (<iframe src={`https://open.spotify.com/embed/track/${initial}`} width="100%" height="152" frameBorder="0" allow="autoplay; encrypted-media" className="rounded-lg"/>)}
    </div>
  );
}
