import type { MediaItem, MediaDetails, MediaKind } from '../../types/media';
const BASE = import.meta.env.VITE_TMDB_API_BASE_URL || 'https://api.themoviedb.org/3';
const KEY = import.meta.env.VITE_TMDB_API_KEY;
export const configured = Boolean(KEY);
export async function tmdb<T>(path: string, params: Record<string,string> = {}): Promise<T> {
  if (!KEY) throw new Error('Add VITE_TMDB_API_KEY to your .env file to load live TMDB catalogue data.');
  const url = new URL(`${BASE.replace(/\/$/,'')}/${path.replace(/^\//,'')}`);
  url.searchParams.set('api_key', KEY);
  Object.entries(params).forEach(([k,v])=>url.searchParams.set(k,v));
  const response = await fetch(url.toString());
  if (!response.ok) throw new Error(response.status === 401 ? 'TMDB rejected the API key. Check your .env configuration.' : `TMDB request failed (${response.status}). Please try again.`);
  return response.json() as Promise<T>;
}
type RawMedia = Omit<MediaItem, 'media_type'> & { media_type?: MediaKind | 'person'; name?: string; original_name?: string };
const normalize = (x:RawMedia):MediaItem => ({...x,title:x.title||x.name||x.original_name||'Untitled',media_type:x.media_type==='tv'||(!x.media_type&&x.first_air_date)?'tv':'movie'});
export async function trending() { return (await tmdb<{results:RawMedia[]}>('trending/all/week')).results.filter(x=>x.media_type!=='person').map(normalize); }
export async function popularMovies() { return (await tmdb<{results:RawMedia[]}>('movie/popular')).results.map(x=>({...normalize(x),media_type:'movie' as const})); }
export async function popularTV() { return (await tmdb<{results:RawMedia[]}>('tv/popular')).results.map(x=>({...normalize(x),media_type:'tv' as const})); }
export async function topRated() { return (await tmdb<{results:RawMedia[]}>('movie/top_rated')).results.map(x=>({...normalize(x),media_type:'movie' as const})); }
export async function searchMedia(query:string) { return (await tmdb<{results:RawMedia[]}>('search/multi',{query,include_adult:'false'})).results.filter(x=>x.media_type==='movie'||x.media_type==='tv').map(normalize); }
export async function discoverMedia(kind:MediaKind,page:number,sortBy:string,genreId:string) { const resolvedSort=sortBy==='release_date.desc'?(kind==='movie'?'primary_release_date.desc':'first_air_date.desc'):sortBy==='release_date.asc'?(kind==='movie'?'primary_release_date.asc':'first_air_date.asc'):sortBy; const params:Record<string,string>={page:String(page),sort_by:resolvedSort,include_adult:'false'}; if(genreId)params.with_genres=genreId; return (await tmdb<{results:RawMedia[];total_pages:number}>('discover/'+kind,params)); }
export async function genreList(kind:MediaKind) { return (await tmdb<{genres:{id:number;name:string}[]}>(`genre/${kind}/list`)).genres; }
export async function mediaDetails(id:number,kind:MediaKind) { return tmdb<MediaDetails>(`${kind}/${id}`,{append_to_response:'credits,videos,similar,recommendations'}); }
export async function genres(kind:MediaKind) { return (await tmdb<{genres:{id:number;name:string}[]}>(`genre/${kind}/list`)).genres; }
