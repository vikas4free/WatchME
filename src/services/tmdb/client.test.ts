import { describe, expect, it, vi, afterEach } from 'vitest';
afterEach(()=>{ vi.unstubAllGlobals(); vi.unstubAllEnvs(); vi.resetModules(); });
describe('TMDB client',()=>{
 it('fails clearly when no API key is configured',async()=>{
  vi.stubEnv('VITE_TMDB_API_KEY','');
  vi.resetModules();
  const { tmdb } = await import('./client');
  await expect(tmdb('trending/all/week')).rejects.toThrow('Add VITE_TMDB_API_KEY');
 });
 it('surfaces non-success HTTP responses',async()=>{
  vi.stubEnv('VITE_TMDB_API_KEY','test-key');
  vi.resetModules();
  const { tmdb } = await import('./client');
  vi.stubGlobal('fetch',vi.fn().mockResolvedValue({ok:false,status:401}));
  await expect(tmdb('trending/all/week')).rejects.toThrow('TMDB rejected the API key');
 });
});
