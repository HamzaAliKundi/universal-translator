import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

// Enhanced error handling for document fetching
export async function getDocuments(page = 1, perPage = 5) {
  try {
    // Check auth state first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError) {
      console.error('Auth error:', authError);
      return {
        error: 'Authentication error. Please try signing in again.',
        documents: [],
        total: 0,
        hasMore: false
      };
    }
    
    if (!user) {
      return {
        error: 'Please sign in to view documents',
        documents: [],
        total: 0,
        hasMore: false
      };
    }

    const start = (page - 1) * perPage;
    const end = start + perPage - 1;

    // Add retry logic for fetch failures
    let retries = 3;
    let lastError;

    while (retries > 0) {
      try {
        const { data, error, count } = await supabase
          .from('documents')
          .select('*', { count: 'exact' })
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .range(start, end);

        if (error) throw error;

        return {
          documents: data || [],
          total: count || 0,
          hasMore: count ? count > (page * perPage) : false
        };
      } catch (error) {
        lastError = error;
        retries--;
        if (retries > 0) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, (3 - retries) * 1000));
        }
      }
    }

    // If all retries failed
    console.error('Failed to fetch documents after retries:', lastError);
    return {
      error: 'Failed to fetch documents. Please try again later.',
      documents: [],
      total: 0,
      hasMore: false
    };
  } catch (error) {
    console.error('Error fetching documents:', error);
    return {
      error: error instanceof Error ? error.message : 'Failed to fetch documents',
      documents: [],
      total: 0,
      hasMore: false
    };
  }
}