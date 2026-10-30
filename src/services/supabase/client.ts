import { createClient } from '@supabase/supabase-js';

const configuredUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

// Accept either the Supabase Project URL or a copied REST URL.
// Supabase JS needs the project origin, not the /rest/v1 path.
function getProjectUrl(value?: string): string | undefined {
  if (!value) return undefined;
  try {
    const parsed = new URL(value.trim());
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return undefined;
    return parsed.origin;
  } catch {
    return undefined;
  }
}

const projectUrl = getProjectUrl(configuredUrl);

export const supabaseConfigured = Boolean(projectUrl && publishableKey);
export const supabase = supabaseConfigured ? createClient(projectUrl!, publishableKey!.trim(), {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
}) : null;
