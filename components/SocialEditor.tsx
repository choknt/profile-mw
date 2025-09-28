"use client";
import { useState } from "react";

export default function SocialEditor({ initial, onChange }:{ initial?:{url:string}[], onChange:(urls:string[])=>void }){
  const [list,setList]=useState<string[]>(initial?.map(s=>s.url)||[]);
  function push(){ if(list.length>=10) return; setList([...list,""]); }
  function set(i:number,v:string){ const a=[...list]; a[i]=v; setList(a); onChange(a); }
  function del(i:number){ const a=list.filter((_,x)=>x!==i); setList(a); onChange(a); }
  return (
    <div className="space-y-2">
      {list.map((url,i)=>(
        <div key={i} className="flex gap-2">
          <input value={url} onChange={e=>set(i,e.target.value)} placeholder="Paste social link (Facebook / TikTok / X / Bluesky / Instagram / ...)" className="flex-1 px-3 py-2 rounded bg-black/20 border border-white/20"/>
          <button onClick={()=>del(i)} className="px-3 py-2 rounded bg-rose-600">Remove</button>
        </div>
      ))}
      {list.length<10 && <button onClick={push} className="px-4 py-2 rounded bg-cyan-500">Add link</button>}
    </div>
  );
}
