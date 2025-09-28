export function parseSocial(raw: string){
  try{
    const u = new URL(raw); const h = u.hostname.replace(/^www\./,"");
    const seg = u.pathname.split("/").filter(Boolean);
    if(h.includes("facebook.com")) return { provider:"facebook", label: seg[0]||"Facebook", url: raw };
    if(h.includes("tiktok.com")) return { provider:"tiktok", label: seg[seg.length-1]||"TikTok", url: raw };
    if(h.includes("x.com")||h.includes("twitter.com")) return { provider:"x", label: seg[0]||"X", url: raw };
    if(h.includes("bsky.app")) return { provider:"bsky", label: seg[0]||"Bluesky", url: raw };
    if(h.includes("instagram.com")) return { provider:"instagram", label: seg[0]||"Instagram", url: raw };
    return { provider:"link", label: raw, url: raw };
  }catch{ return { provider:"link", label: raw, url: raw }; }
}
