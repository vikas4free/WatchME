import { create } from 'zustand';
import type { MediaItem } from '../types/media';
import { supabase } from '../services/supabase/client';

interface Progress { item:MediaItem; seconds:number; duration:number; updatedAt:number }
interface LibraryRow {
  tmdb_id:number; media_type:'movie'|'tv'; title:string; item_data:MediaItem;
  is_watchlisted:boolean; is_favorite:boolean; progress_seconds:number|null;
  progress_duration:number|null; progress_updated_at:string|null;
}
interface LibraryState {
  watchlist:MediaItem[]; favorites:number[]; progress:Record<number,Progress>;
  userId:string|null;
  setUserId:(userId:string|null)=>void;
  loadCloudLibrary:(userId:string)=>Promise<void>;
  toggleWatchlist:(item:MediaItem)=>void;\n  updateItem:(item:MediaItem)=>void;
  toggleFavorite:(id:number,item?:MediaItem)=>void;
  saveProgress:(item:MediaItem,seconds:number,duration:number)=>void;
  clearLibrary:()=>void;
}
const mediaKind=(item:MediaItem)=>item.media_type==='tv'?'tv':'movie';
async function saveCloudRow(userId:string,item:MediaItem,state:Pick<LibraryState,'watchlist'|'favorites'|'progress'>) {
  if(!supabase)return;
  const kind=mediaKind(item);
  const isWatchlisted=state.watchlist.some(x=>x.id===item.id&&mediaKind(x)===kind);
  const isFavorite=state.favorites.includes(item.id);
  const progress=state.progress[item.id];
  if(!isWatchlisted&&!isFavorite&&!progress){
    await supabase.from('user_library').delete().eq('user_id',userId).eq('tmdb_id',item.id).eq('media_type',kind);
    return;
  }
  const row={
    user_id:userId,tmdb_id:item.id,media_type:kind,title:item.title,item_data:item,
    is_watchlisted:isWatchlisted,is_favorite:isFavorite,
    progress_seconds:progress?.seconds??null,progress_duration:progress?.duration??null,
    progress_updated_at:progress?new Date(progress.updatedAt).toISOString():null,updated_at:new Date().toISOString()
  };
  const {error}=await supabase.from('user_library').upsert(row,{onConflict:'user_id,tmdb_id,media_type'});
  if(error)console.error('Could not sync WatchME library:',error.message);
}
export const useLibrary = create<LibraryState>()((set,get)=>({
  watchlist:[],favorites:[],progress:{},userId:null,
  setUserId:(userId)=>set({userId,watchlist:[],favorites:[],progress:{}}),
  loadCloudLibrary:async(userId)=>{
    if(!supabase)return;
    const {data,error}=await supabase.from('user_library').select('*').eq('user_id',userId);
    if(error){console.error('Could not load WatchME library:',error.message);return}
    const rows=(data||[]) as LibraryRow[];
    const watchlist=rows.filter(row=>row.is_watchlisted).map(row=>({...row.item_data,media_type:row.media_type}));
    const favorites=rows.filter(row=>row.is_favorite).map(row=>row.tmdb_id);
    const progress:Record<number,Progress>={};
    rows.filter(row=>row.progress_seconds!==null&&row.progress_duration!==null).forEach(row=>{
      const item={...row.item_data,media_type:row.media_type} as MediaItem;
      progress[row.tmdb_id]={item,seconds:row.progress_seconds!,duration:row.progress_duration!,updatedAt:row.progress_updated_at?new Date(row.progress_updated_at).getTime():Date.now()};
    });
    set({userId,watchlist,favorites,progress});
  },
  updateItem:(item)=>{\n    const current=get();\n    set(state=>({watchlist:state.watchlist.map(x=>x.id===item.id&&mediaKind(x)===mediaKind(item)?item:x),progress:state.progress[item.id]?{...state.progress,[item.id]:{...state.progress[item.id],item}}:state.progress}));\n    if(current.userId)void saveCloudRow(current.userId,item,get());\n  },\n  toggleWatchlist:(item)=>{
    const current=get();
    const exists=current.watchlist.some(x=>x.id===item.id&&mediaKind(x)===mediaKind(item));
    set(state=>({watchlist:exists?state.watchlist.filter(x=>!(x.id===item.id&&mediaKind(x)===mediaKind(item))):[item,...state.watchlist]}));
    if(current.userId)void saveCloudRow(current.userId,item,get());
  },
  toggleFavorite:(id,item)=>{
    const current=get();
    const target=item||current.watchlist.find(x=>x.id===id)||current.progress[id]?.item;
    set(state=>({favorites:state.favorites.includes(id)?state.favorites.filter(x=>x!==id):[...state.favorites,id]}));
    if(current.userId&&target)void saveCloudRow(current.userId,target,get());
  },
  saveProgress:(item,seconds,duration)=>{
    const current=get();
    set(state=>({progress:{...state.progress,[item.id]:{item,seconds,duration,updatedAt:Date.now()}}}));
    if(current.userId)void saveCloudRow(current.userId,item,get());
  },
  clearLibrary:()=>{
    const current=get();
    set({watchlist:[],favorites:[],progress:{}});
    if(current.userId&&supabase)void supabase.from('user_library').delete().eq('user_id',current.userId);
  }
}));
