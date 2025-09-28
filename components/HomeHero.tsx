"use client";
import Link from "next/link";
import { motion } from "framer-motion";

const Icon=(p:any)=><svg viewBox="0 0 24 24" aria-hidden="true" {...p}/>;
const Discord=(p:any)=><Icon {...p}><path d="M20.317 4.369A19.791..." fill="currentColor"/></Icon>;
const Facebook=(p:any)=><Icon {...p}><path d="M22 12a10 10..." fill="currentColor"/></Icon>;
const TikTok=(p:any)=><Icon {...p}><path d="M21 8.5a7.5..." fill="currentColor"/></Icon>;
const XIcon=(p:any)=><Icon {...p}><path d="M18.3 2H21l-6.63..." fill="currentColor"/></Icon>;
const Bluesky=(p:any)=><Icon {...p}><path d="M12 11.2c2.6-3.5..." fill="currentColor"/></Icon>;

function Waves(){return(<div className="absolute inset-x-0 bottom-0 h-48 overflow-hidden pointer-events-none select-none text-[#8bd3ff]">
  <svg className="absolute h-48 w-[200%] animate-[wave_14s_linear_infinite]" viewBox="0 0 1440 96" preserveAspectRatio="none"><path d="M0 64c60 0 120-32..." fill="currentColor" className="opacity-40"/></svg>
  <svg className="absolute h-48 w-[200%] animate-[wave_18s_linear_infinite_reverse]" viewBox="0 0 1440 96" preserveAspectRatio="none"><path d="M0 64c60 0 120-24..." fill="currentColor" className="opacity-30"/></svg>
  <style jsx>{`@keyframes wave{to{transform:translateX(-50%)}}`}</style>
</div>);}
function WarshipSVG(props:React.SVGProps<SVGSVGElement>){return(<svg viewBox="0 0 512 256" {...props}>
  <path d="M40 170h280l40 20H64L40 170Z" fill="#0b3355"/><path d="M64 190h296c-8 8-28 18-72 18H116c-42 0-60-10-52-18Z" fill="#0e406a"/>
  <rect x="150" y="130" width="120" height="20" fill="#1c5d8f"/><rect x="190" y="110" width="60" height="18" fill="#2a7ab7"/>
  <rect x="210" y="88" width="28" height="22" fill="#3ea2e6"/><rect x="223" y="56" width="4" height="32" fill="#cde8ff"/>
  <rect x="130" y="140" width="28" height="6" fill="#2a7ab7"/><rect x="116" y="140" width="18" height="4" fill="#cde8ff"/>
  <path d="M40 170c8 10 20 16 28 18" stroke="#cde8ff" strokeWidth="3" fill="none"/></svg>);}

export default function HomeHero(){
  return(<div className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#021a2e] via-[#063a66] to-[#0b5fa2] text-white">
    <div className="pointer-events-none absolute -top-24 -left-24 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl"/><div className="pointer-events-none absolute -top-10 right-10 h-64 w-64 rounded-full bg-blue-300/20 blur-3xl"/>
    <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
      <Link href="/" className="text-lg font-semibold tracking-wide text-white/90 hover:text-white">MW Profiles</Link>
      <nav className="flex items-center gap-2">
        <a href="#" className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="Discord"><Discord className="h-5 w-5"/></a>
        <a href="#" className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="Facebook"><Facebook className="h-5 w-5"/></a>
        <a href="#" className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="TikTok"><TikTok className="h-5 w-5"/></a>
        <a href="#" className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="X"><XIcon className="h-5 w-5"/></a>
        <a href="#" className="rounded-full bg-white/10 p-2 hover:bg-white/20" aria-label="Bluesky"><Bluesky className="h-5 w-5"/></a>
      </nav>
    </header>
    <main className="relative z-10 mx-auto max-w-7xl px-6">
      <div className="grid items-center gap-8 pt-6 md:grid-cols-2 md:pt-10">
        <div className="py-6 md:py-12">
          <p className="text-xs uppercase tracking-widest text-cyan-200/80 md:text-sm">Modern Warships Community</p>
          <h1 className="mt-3 text-4xl font-extrabold leading-tight md:text-6xl">Modern Warships Command Registry</h1>
          <p className="mt-4 max-w-prose text-white/85 md:text-lg">Establish your official commander profile and showcase your fleet identity.</p>
          <div className="mt-10">
            <p className="mb-3 text-white/80">Would you like to create your profile?</p>
            <div className="flex flex-wrap gap-3">
              <Link href="/create" className="inline-flex items-center justify-center rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-[#012] shadow-sm transition hover:bg-cyan-300 active:bg-cyan-200">Proceed</Link>
              <Link href="/redeem" className="inline-flex items-center justify-center rounded-xl border border-white/30 px-5 py-3 font-semibold text-white/90 transition hover:bg-white/10">Redeem code</Link>
            </div>
          </div>
        </div>
        <div className="relative h-[360px] md:h-[440px]">
          <motion.div className="absolute inset-x-0 mx-auto w-[92%] md:w-[85%]" initial={{ y: 20, rotate: -1 }} animate={{ y: [20, -6, 20], rotate: [-1.2, .2, -1.2] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
            <WarshipSVG className="w-full drop-shadow-[0_20px_40px_rgba(0,0,0,0.4)]"/>
          </motion.div>
          <div className="absolute -top-10 -left-6 h-40 w-40 rotate-12 rounded-full bg-cyan-200/20 blur-2xl"/>
        </div>
      </div>
    </main>
    <Waves/>
    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_50%_at_50%_0%,rgba(255,255,255,.12),transparent_60%)]"/>
  </div>);
}
