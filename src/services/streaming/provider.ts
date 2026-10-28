import type { MediaKind } from '../../types/media';
export interface PlaybackRequest { id:number; kind:MediaKind; season?:number; episode?:number; title:string }
export interface PlaybackSource { url:string; type:'video/mp4'|'application/vnd.apple.mpegurl'|'application/dash+xml'; label?:string; subtitles?:{label:string;src:string;srclang:string}[] }
export interface StreamingProvider { readonly name:string; resolve(request:PlaybackRequest):Promise<PlaybackSource[]> }
/** No public CineSRC API contract was supplied. Never guess endpoints or manufacture stream URLs. */
export const cineSrcProvider:StreamingProvider = {
  name:'CineSRC',
  async resolve(_request) { throw new Error('CineSRC playback is not connected yet. Add its documented, authorized API/SDK configuration to src/services/streaming/provider.ts. WatchME will not invent a stream URL.'); }
};
