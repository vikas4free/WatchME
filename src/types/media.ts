export type MediaKind = 'movie' | 'tv';
export interface MediaItem {
  id: number; title: string; overview: string; poster_path: string | null; backdrop_path: string | null;
  vote_average: number; release_date?: string; first_air_date?: string; media_type?: MediaKind; genre_ids?: number[]; tmdb_url?: string; poster_url?: string;
}
export interface MediaDetails extends MediaItem { runtime?: number; genres?: { id:number; name:string }[]; number_of_seasons?: number; number_of_episodes?: number; tagline?: string; credits?: { cast: {id:number;name:string;character:string;profile_path:string|null}[] }; videos?: { results: {key:string;site:string;type:string;name:string}[] } }
export const mediaTitle = (item: MediaItem) => item.title || (item as MediaItem & {name?:string}).name || 'Untitled';
export const mediaYear = (item: MediaItem) => (item.release_date || item.first_air_date || '').slice(0,4);
export const posterUrl = (path: string | null, size = 'w500') => path ? `https://image.tmdb.org/t/p/${size}${path}` : '';
export const mediaPosterUrl = (item: MediaItem, size = 'w500') => item.poster_url || (item.id === 1100 ? 'https://images.fanart.tv/bigpreview/how-i-met-your-mother-5d53fff52dcab.jpg' : posterUrl(item.poster_path, size));
