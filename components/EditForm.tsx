"use client";
import { useEffect, useRef, useState } from "react";
import SpotifyPicker from "./SpotifyPicker";
import SocialEditor from "./SocialEditor";

const COUNTRIES=[{code:"TH",label:"Thailand"},{code:"US",label:"United States"},{code:"JP",label:"Japan"}];
const STATUS_OPTIONS=[{key:"rookie",label:"Rookie"},{key:"event",label:"Event Winner"},{key:"verified",label:"Verified Commander"}];
const BG_PRESETS = [
  { key:"ocean", label:"Ocean (Blue)", class:"bg-ocean" },
  { key:"sunset", label:"Sunset (Purple/Orange)", class:"bg-sunset" },
  { key:"abyss", label:"Abyss (Deep blue)", class:"bg-abyss" }
];

export default function EditForm({ handle }:{ handle:string }){
  const [me,setMe]=useState<any>(null);
  const [bio,setBio]=useState(""); const [displayName,setDisplayName]=useState("");
  const [handleNew,setHandleNew]=useState(handle); const [country,setCountry]=useState("TH"); const [status,setStatus]=useState("");
  const [musicId,setMusicId]=useState<string|undefined>(undefined);
  const [socialUrls,setSocialUrls]=useState<string[]>([]);
  const [favoriteShip,setFavoriteShip]=useState<{name:string,code?:string,imageUrl?:string}|null>(null);
  const [bgKind,setBgKind]=useState<"preset"|"color"|"image">("preset");
  const [bgValue,setBgValue]=useState("ocean");
  const [frame,setFrame]=useState(""); const [effect,setEffect]=useState("");
  const [gallery,setGallery]=useState<string[]>([]);
  const [avatar,setAvatar]=useState<string>("");
  const [showClan,setShowClan]=useState(true);

  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(()=>{ (async()=>{
    const r=await fetch("/api/me"); if(!r.ok) return;
    const d=await r.json();
    setMe(d);
    setDisplayName(d.displayName||""); setBio(d.bio||""); setCountry(d.countryCode||"TH"); setStatus(d.statusKey||"");
    setMusicId(d.musicTrackId); setSocialUrls((d.socials||[]).map((s:any)=>s.url)); setFavoriteShip(d.favoriteShipName?{name:d.favoriteShipName, code:d.favoriteShipCode, imageUrl:d.favoriteShipImage}:null);
    const known = BG_PRESETS.find(p => (d.bgKind==="color" and d.bgValue===p.key));
    if(known){ setBgKind("preset"); setBgValue(known.key); }
    else if(d.bgKind==="image"){ setBgKind("image"); setBgValue(d.bgValue||""); }
    else { setBgKind("color"); setBgValue(d.bgValue || "#0b5fa2"); }
    setFrame(d.frameKey||""); setEffect(d.effectKey||""); setAvatar(d.avatarUrl||""); setGallery((d.gallery||[]).map((g:any)=>g.url));
    setShowClan(d.showClan !== false);
  })(); },[]);

  async function uploadToCloudinary(file:File, folder:string){
    const sig=await fetch("/api/upload/sign",{method:"POST"}).then(r=>r.json());
    const fd=new FormData();
    fd.append("file",file);
    fd.append("upload_preset",sig.uploadPreset);
    fd.append("timestamp",sig.timestamp);
    fd.append("signature",sig.signature);
    const res=await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/auto/upload`,{method:"POST",body:fd});
    const json=await res.json(); return json.secure_url as string;
  }

  async function save(){
    const background =
      bgKind==="preset" ? { kind:"color", value: bgValue } :
      bgKind==="color"  ? { kind:"color", value: bgValue } :
                          { kind:"image", value: bgValue };

    const r=await fetch("/api/profile/update",{ method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({
      displayName, handle: handleNew, bio, country, status, music:{ trackId: musicId, embedUrl: musicId ? `https://open.spotify.com/embed/track/${musicId}`: undefined, enabled: !!musicId },
      socials: socialUrls.map(u=>({url:u})), favoriteShip, background, frame:{key:frame}, effect:{key:effect},
      avatarUrl: avatar, gallery, privacy:{ showClan: showClan }
    })});
    if(r.ok) alert("Saved"); else alert(await r.text());
  }

  async function saveImage(){
    const a = document.createElement("a");
    a.href = avatar || "/avatar.png";
    a.download = "avatar.jpg";
    a.click();
  }

  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <section className="p-4 rounded-xl bg-white/5 space-y-3">
            <h2 className="font-semibold">Profile Picture</h2>
            <div className="flex items-center gap-4">
              <img src={avatar || "/avatar.png"} className="w-24 h-24 rounded-full object-cover"/>
              <input type="file" accept="image/*" onChange={async(e)=>{ const f=e.target.files?.[0]; if(!f) return; const url=await uploadToCloudinary(f,"avatars"); setAvatar(url);} }/>
            </div>
            <div className="hidden md:block"><button onClick={saveImage} className="rounded bg-white/10 px-3 py-2 hover:bg-white/20">Save Image</button></div>
          </section>

          <section className="p-4 rounded-xl bg-white/5 space-y-3">
            <h2 className="font-semibold">Status</h2>
            <select value={status} onChange={e=>setStatus(e.target.value)} className="w-full px-3 py-2 rounded bg-black/20 border border-white/20">
              <option value="">-- Select --</option>{STATUS_OPTIONS.map(o=><option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </section>

          <section className="p-4 rounded-xl bg-white/5 space-y-3">
            <h2 className="font-semibold">Display Name</h2>
            <input value={displayName} onChange={e=>setDisplayName(e.target.value)} className="w-full px-3 py-2 rounded bg-black/20 border border-white/20"/>
            <p className="text-xs text-white/60">Can be changed every 15 days.</p>
          </section>

          <section className="p-4 rounded-xl bg-white/5 space-y-3">
            <h2 className="font-semibold">Handle</h2>
            <input value={handleNew} onChange={e=>setHandleNew(e.target.value.toLowerCase())} className="w-full px-3 py-2 rounded bg-black/20 border border-white/20"/>
            <p className="text-xs text-white/60">URL: playmw.fun/{handleNew}</p>
          </section>

          <section className="p-4 rounded-xl bg-white/5 space-y-3">
            <h2 className="font-semibold">Bio</h2>
            <textarea value={bio} onChange={(e)=>setBio(e.target.value)} rows={4} className="w-full px-3 py-2 rounded bg-black/20 border border-white/20"/>
            <p className="text-xs text-white/60">{bio.trim().split(/\s+/).filter(Boolean).length} / 250 words</p>
          </section>

          <section className="p-4 rounded-xl bg-white/5 space-y-3">
            <h2 className="font-semibold">Profile Music</h2>
            <SpotifyPicker initial={musicId} onPick={(id)=>setMusicId(id)} />
          </section>

          <section className="p-4 rounded-xl bg-white/5 space-y-3">
            <h2 className="font-semibold">Social links (up to 10)</h2>
            <SocialEditor initial={me?.socials} onChange={setSocialUrls}/>
          </section>

          <section className="p-4 rounded-xl bg-white/5 space-y-3">
            <h2 className="font-semibold">Country</h2>
            <select value={country} onChange={e=>setCountry(e.target.value)} className="w-full px-3 py-2 rounded bg-black/20 border border-white/20">
              {COUNTRIES.map(c=><option key={c.code} value={c.code}>{c.label}</option>)}
            </select>
          </section>

          <section className="p-4 rounded-xl bg-white/5">
            <h2 className="font-semibold">Account Order</h2>
            <input value={`#${me?.accountOrder ?? "-"}`} disabled className="w-full px-3 py-2 rounded bg-black/20 border border-white/20 text-white/60"/>
          </section>

          <section className="p-4 rounded-xl bg-white/5">
            <h2 className="font-semibold">Profile Frame</h2>
            <select value={frame} onChange={e=>setFrame(e.target.value)} className="w-full px-3 py-2 rounded bg-black/20 border border-white/20">
              <option value="">None</option><option value="event2025">Event 2025</option><option value="founder">Founder</option>
            </select>
          </section>

          <section className="p-4 rounded-xl bg-white/5 space-y-3">
            <h2 className="font-semibold">Profile Background</h2>
            <div className="flex gap-3 flex-wrap">
              <label className="flex items-center gap-2"><input type="radio" checked={bgKind==="preset"} onChange={()=>setBgKind("preset")}/> Preset</label>
              <label className="flex items-center gap-2"><input type="radio" checked={bgKind==="color"} onChange={()=>setBgKind("color")}/> Solid color</label>
              <label className="flex items-center gap-2"><input type="radio" checked={bgKind==="image"} onChange={()=>setBgKind("image")}/> Custom image</label>
            </div>
            {bgKind==="preset" && (
              <div className="grid grid-cols-3 gap-2">
                {BG_PRESETS.map(p=>(
                  <button type="button" key={p.key} onClick={()=>setBgValue(p.key)}
                          className={`h-12 rounded ${p.class} ${bgValue===p.key ? "ring-2 ring-cyan-400" : ""}`}/>
                ))}
              </div>
            )}
            {bgKind==="color" && (<input type="color" value={bgValue} onChange={e=>setBgValue(e.target.value)} className="w-24 h-12 p-0 rounded"/>)}
            {bgKind==="image" && (<input type="file" accept="image/*" onChange={async(e)=>{ const f=e.target.files?.[0]; if(!f) return; const url=await uploadToCloudinary(f,"backgrounds"); setBgValue(url);} }/>)}
            <p className="text-xs text-white/60">Background is softened automatically for readability.</p>
          </section>

          <section className="p-4 rounded-xl bg-white/5">
            <h2 className="font-semibold">Profile Effect</h2>
            <select value={effect} onChange={e=>setEffect(e.target.value)} className="w-full px-3 py-2 rounded bg-black/20 border border-white/20">
              <option value="">None</option><option value="sparkle">Sparkle</option><option value="glow">Glow</option>
            </select>
          </section>

          <section className="p-4 rounded-xl bg-white/5 space-y-3">
            <h2 className="font-semibold">Favorite Ship</h2>
            <input placeholder="Ship name (e.g., USS Fletcher)" value={favoriteShip?.name||""} onChange={e=>setFavoriteShip({name:e.target.value})} className="w-full px-3 py-2 rounded bg-black/20 border border-white/20"/>
          </section>

          <section className="p-4 rounded-xl bg-white/5 space-y-3">
            <h2 className="font-semibold">Privacy</h2>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={showClan} onChange={(e)=>setShowClan(e.target.checked)}/>
              Show clan on my public profile
            </label>
          </section>

          <div className="pt-2"><button onClick={save} className="w-full md:w-auto px-5 py-3 rounded-xl bg-cyan-500 font-semibold">Save changes</button></div>
        </div>

        <div className="space-y-6">
          <section ref={previewRef} className={`rounded-2xl p-5 ${bgKind==="preset" ? BG_PRESETS.find(p=>p.key===bgValue)?.class : "bg-white/5"}`}>
            <div className="rounded-xl p-4 scrim">
              <div className="flex items-center gap-4">
                <img src={avatar || "/avatar.png"} className="w-20 h-20 rounded-full object-cover"/>
                <div>
                  <div className="text-xl font-bold">{displayName || handleNew}</div>
                  <div className="text-sm text-white/70">playmw.fun/{handleNew}</div>
                </div>
              </div>
              <p className="mt-3 text-white/90">{bio || "Your bio will appear here."}</p>
            </div>
          </section>

          <section className="p-4 rounded-xl bg-white/5 space-y-3">
            <h2 className="font-semibold">Gallery (up to 5)</h2>
            <div className="flex flex-wrap gap-3">
              {gallery.map((g,i)=>(
                <div key={i} className="relative">
                  <img src={g} className="w-24 h-24 object-cover rounded"/>
                  <button onClick={()=>setGallery(gallery.filter((_,x)=>x!==i))} className="absolute -top-2 -right-2 bg-rose-600 rounded-full px-2 py-1 text-xs">✕</button>
                </div>
              ))}
              {gallery.length<5 && (
                <label className="px-3 py-2 rounded bg-white/10 cursor-pointer">
                  Upload
                  <input type="file" accept="image/*" className="hidden" onChange={async(e)=>{ const f=e.target.files?.[0]; if(!f) return; const url=await uploadToCloudinary(f,"gallery"); setGallery([...gallery,url]); }}/>
                </label>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
