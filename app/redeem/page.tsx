"use client";
import { useState } from "react";

export default function RedeemPage(){
  const [code,setCode]=useState(""); const [msg,setMsg]=useState<string | null>(null);

  async function redeem(){
    setMsg(null);
    const r=await fetch("/api/redeem",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ code }) });
    if(r.ok){ const d=await r.json(); setMsg(`Redeemed: ${d.reward}`); }
    else setMsg(await r.text());
  }

  return (
    <main className="mx-auto max-w-md p-6">
      <h1 className="text-2xl font-bold">Redeem Gift Code</h1>
      <div className="mt-4 space-y-2 rounded-xl bg-white/5 p-4">
        <input value={code} onChange={e=>setCode(e.target.value)} placeholder="Enter your code" className="w-full rounded bg-black/20 border border-white/20 px-3 py-2"/>
        <button onClick={redeem} className="w-full rounded bg-cyan-500 px-4 py-2">Redeem</button>
        {msg && <div className="text-sm text-white/80">{msg}</div>}
      </div>
    </main>
  );
}
