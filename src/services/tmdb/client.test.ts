import { describe, expect, it, vi, afterEach } from 'vitest';
import { tmdb } from './client';
afterEach(()=>vi.unstubAllGlobals());
describe('TMDB client',()=>{
 it('fails clearly when no API key is configured',async()=>{await expect(tmdb('trending/all/week')).rejects.toThrow('Add VITE_TMDB_API_KEY');});
 it('surfaces non-success HTTP responses',async()=>{vi.stubEnv('VITE_TMDB_API_KEY','test-key');vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status:401}));await expect(tmdb('trending/all/week')).rejects.toThrow('TMDB rejected the API key');});
});
