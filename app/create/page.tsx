"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CreatePage(){
  const [step,setStep]=useState<1|2>(1);
  const [gameId,setGameId]=useState("");
  const [handle,setHandle]=useState("");
  const [level,setLevel]=useState<number>(1);
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const router=useRouter();

  async function onSignup(){
    const r=await fetch("/api/auth/signup",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({gameId,handle,level,email,password})});
    if(r.ok){ router.push(`/${handle}/edit`); } else { alert(await r.text()); }
  }

  return (
    <main className="mx-auto max-w-xl p-6 space-y-6">
      <h1 className="text-2xl font-bold">Create your profile</h1>

      {step===1 && (<section className="space-y-3 p-4 rounded-xl bg-white/5">
        <h2 className="font-semibold">Step 1 · Game details</h2>
        <input value={gameId} onChange={e=>setGameId(e.target.value)} placeholder="Game ID" className="w-full px-3 py-2 rounded bg-black/20 border border-white/20"/>
        <input value={handle} onChange={e=>setHandle(e.target.value.toLowerCase())} placeholder="Desired username (handle)" className="w-full px-3 py-2 rounded bg-black/20 border border-white/20"/>
        <input type="number" value={level} onChange={e=>setLevel(parseInt(e.target.value||"1"))} placeholder="Level" className="w-full px-3 py-2 rounded bg-black/20 border border-white/20"/>
        <button onClick={()=>setStep(2)} className="w-full py-3 rounded-xl bg-cyan-500 font-semibold">Continue</button>
      </section>)}

      {step===2 && (<section className="space-y-3 p-4 rounded-xl bg-white/5">
        <h2 className="font-semibold">Step 2 · Create account</h2>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2 rounded bg-black/20 border border-white/20"/>
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" className="w-full px-3 py-2 rounded bg-black/20 border border-white/20"/>
        <button onClick={onSignup} className="w-full py-3 rounded-xl bg-cyan-500 font-semibold">Sign up</button>
      </section>)}
    </main>
  );
}
