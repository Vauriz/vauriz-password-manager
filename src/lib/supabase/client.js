import { createBrowserClient } from '@supabase/ssr';

let client = null;

export function createClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Guard against placeholder values during build-time prerendering
  if (!url.startsWith('http')) {
    // Return a dummy object that won't throw during SSR/prerender
    return {
      auth: {
        getUser: async () => ({ data: { user: null } }),
        signUp: async () => ({ error: new Error('Supabase not configured') }),
        signInWithPassword: async () => ({ error: new Error('Supabase not configured') }),
        signOut: async () => {},
        exchangeCodeForSession: async () => ({ error: new Error('Supabase not configured') }),
      },
      from: () => ({
        select: () => ({ order: async () => ({ data: [], error: null }) }),
        insert: async () => ({ error: new Error('Supabase not configured') }),
        delete: () => ({ eq: async () => ({ error: new Error('Supabase not configured') }) }),
      }),
    };
  }

  client = createBrowserClient(url, key);
  return client;
}
