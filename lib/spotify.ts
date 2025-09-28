let tokenCache: { token:string; exp:number } | null = null;
export async function getSpotifyToken(){
  if(tokenCache && Date.now() < tokenCache.exp) return tokenCache.token;
  const r = await fetch("https://accounts.spotify.com/api/token", {
    method:"POST",
    headers:{ "Content-Type":"application/x-www-form-urlencoded",
      Authorization:"Basic "+Buffer.from(process.env.SPOTIFY_CLIENT_ID+":"+process.env.SPOTIFY_CLIENT_SECRET).toString("base64") },
    body:"grant_type=client_credentials"
  });
  const d = await r.json();
  tokenCache = { token: d.access_token, exp: Date.now()+d.expires_in*1000-60_000 };
  return tokenCache.token;
}
