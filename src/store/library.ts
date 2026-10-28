import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { MediaItem } from '../types/media';
interface Progress { item:MediaItem; seconds:number; duration:number; updatedAt:number }
interface LibraryState { watchlist:MediaItem[]; favorites:number[]; progress:Record<number,Progress>; toggleWatchlist:(item:MediaItem)=>void; toggleFavorite:(id:number)=>void; saveProgress:(item:MediaItem,seconds:number,duration:number)=>void; clearLibrary:()=>void }
export const useLibrary = create<LibraryState>()(persist((set)=>({
 watchlist:[],favorites:[],progress:{},
 toggleWatchlist:(item)=>set(s=>({watchlist:s.watchlist.some(x=>x.id===item.id)?s.watchlist.filter(x=>x.id!==item.id):[item,...s.watchlist]})),
 toggleFavorite:(id)=>set(s=>({favorites:s.favorites.includes(id)?s.favorites.filter(x=>x!==id):[...s.favorites,id]})),
 saveProgress:(item,seconds,duration)=>set(s=>({progress:{...s.progress,[item.id]:{item,seconds,duration,updatedAt:Date.now()}}})),
 clearLibrary:()=>set({watchlist:[],favorites:[],progress:{}})
}),{name:'watchme-library-v1',storage:createJSONStorage(()=>localStorage)}));
