import { getSpotifyToken } from "@/lib/spotify";
export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  if(!q) return new Response("Missing query", { status:400 });
  const token = await getSpotifyToken();
  const res = await fetch(`https://api.spotify.com/v1/search?type=track&limit=8&q=${encodeURIComponent(q)}`, { headers:{ Authorization:`Bearer ${token}` } });
  const json = await res.json();
  return Response.json((json.tracks?.items||[]).map((t:any)=>({ id:t.id, name:t.name, by:t.artists.map((a:any)=>a.name).join(", "), cover:t.album.images?.[1]?.url })));
}
