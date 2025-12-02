import { createClient } from '@supabase/supabase-js';

// Supabase configuration
// You'll need to replace these with your actual Supabase project credentials
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || '';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || '';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Electron doesn't use URL for auth
  },
});

// Check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabaseUrl && supabaseAnonKey && supabaseUrl.includes('supabase');
};

// Test Supabase connection
export const testSupabaseConnection = async () => {
  try {
    console.log('Testing Supabase connection...');
    const start = Date.now();
    const { data, error } = await supabase.from('conversations').select('id').limit(1);
    const elapsed = Date.now() - start;
    console.log(`Supabase connection test: ${elapsed}ms`, { data, error });
    return { success: !error, elapsed, error: error?.message };
  } catch (err) {
    console.error('Supabase connection test failed:', err);
    return { success: false, error: err.message };
  }
};

// Auth helper functions
export const signUp = async (email, password, displayName) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
      },
    },
  });

  if (error) throw error;

  // Manually create profile if user was created (trigger may not work due to RLS)
  if (data.user) {
    try {
      await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: email,
          display_name: displayName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id',
        });
    } catch (profileError) {
      console.error('Could not create profile:', profileError);
      // Don't throw - user was created successfully, profile can be created later
    }
  }

  return data;
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Ensure profile exists for this user
  if (data.user) {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single();

      if (!existingProfile) {
        // Create profile if it doesn't exist
        await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            display_name: data.user.user_metadata?.display_name || email.split('@')[0],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id',
          });
      }
    } catch (profileError) {
      console.error('Could not ensure profile exists:', profileError);
    }
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getSession = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  return session;
};

// Direct REST API upsert for conversations (bypasses Supabase client issues)
const upsertConversationViaRest = async (payload, accessToken) => {
  const url = `${supabaseUrl}/rest/v1/conversations`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000);

  const authToken = accessToken || supabaseAnonKey;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('REST upsert error:', response.status, errorText);
      return { error: errorText };
    }

    return { success: true };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.error('REST upsert aborted (timeout)');
    } else {
      console.error('REST upsert error:', err.message);
    }
    return { error: err.message };
  }
};

// Conversation sync functions
export const syncConversationsToCloud = async (userId, conversations, accessToken = null) => {
  if (!conversations || conversations.length === 0) {
    console.log('No conversations to sync');
    return { success: true, synced: 0 };
  }

  console.log(`Syncing ${conversations.length} conversations for user ${userId}`);
  console.log('Using provided access token:', !!accessToken);
  let synced = 0;
  let errors = [];

  for (const conv of conversations) {
    // Skip conversations with only the initial welcome message
    if (!conv.messages || conv.messages.length <= 1) {
      console.log('Skipping empty conversation:', conv.id);
      continue;
    }

    const payload = {
      id: conv.id,
      user_id: userId,
      title: conv.title || 'New Chat',
      messages: conv.messages,
      created_at: conv.createdAt || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log('Attempting to sync conversation:', conv.id, 'messages:', conv.messages.length);

    // Use REST API with upsert (faster, no need to check if exists first)
    const result = await upsertConversationViaRest(payload, accessToken);

    if (result.error) {
      console.error('Error syncing conversation:', conv.id, result.error);
      errors.push({ id: conv.id, error: result.error });
    } else {
      console.log('Synced conversation:', conv.id);
      synced++;
    }
  }

  console.log(`Sync complete: ${synced} synced, ${errors.length} errors`);
  return { success: errors.length === 0, synced, errors };
};

// Track ongoing fetches to prevent duplicates
let fetchInProgress = null;
let lastFetchTime = 0;

// Direct REST API fetch for conversations (bypasses potential Supabase client issues)
const fetchConversationsViaRest = async (userId, accessToken) => {
  const url = `${supabaseUrl}/rest/v1/conversations?user_id=eq.${userId}&order=updated_at.desc`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  // Use access token if available, otherwise fall back to anon key
  const authToken = accessToken || supabaseAnonKey;

  try {
    console.log('REST fetch URL:', url);
    console.log('Using access token:', !!accessToken);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': supabaseAnonKey,
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log('REST response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('REST API error:', response.status, errorText);
      return null;
    }

    const data = await response.json();
    console.log('REST API returned', data?.length || 0, 'conversations');
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.error('REST fetch aborted (timeout)');
    } else {
      console.error('REST fetch error:', err.message);
    }
    return null;
  }
};

export const fetchConversationsFromCloud = async (userId, accessToken = null) => {
  console.log('fetchConversationsFromCloud called with userId:', userId);
  console.log('Using provided access token:', !!accessToken);

  if (!userId) {
    console.error('fetchConversationsFromCloud: No userId provided!');
    return [];
  }

  // If a fetch was started less than 5 seconds ago, return empty to prevent spam
  const now = Date.now();
  if (fetchInProgress && now - lastFetchTime < 5000) {
    console.log('fetchConversationsFromCloud: Recent fetch in progress, skipping');
    return [];
  }

  lastFetchTime = now;

  // Create the fetch promise
  fetchInProgress = (async () => {
    try {
      console.log('Querying conversations table for user_id:', userId);
      const startTime = Date.now();

      // Try REST API first (more reliable with proper timeout)
      console.log('Trying REST API fetch...');
      let data = await fetchConversationsViaRest(userId, accessToken);

      // If REST fails, try Supabase client as fallback
      if (data === null) {
        console.log('REST failed, trying Supabase client...');
        try {
          const result = await supabase
            .from('conversations')
            .select('*')
            .eq('user_id', userId)
            .order('updated_at', { ascending: false });

          if (result.error) {
            console.error('Supabase client error:', result.error.message);
            return [];
          }
          data = result.data;
        } catch (clientErr) {
          console.error('Supabase client exception:', clientErr.message);
          return [];
        }
      }

      const elapsed = Date.now() - startTime;
      console.log(`Query completed in ${elapsed}ms, got ${data?.length || 0} conversations`);

      if (!data || data.length === 0) {
        console.log('No conversations found in cloud');
        return [];
      }

      // Transform to local format
      const transformed = data.map(conv => ({
        id: conv.id,
        title: conv.title,
        messages: Array.isArray(conv.messages) ? conv.messages : [],
        createdAt: conv.created_at,
        updatedAt: conv.updated_at,
      }));

      console.log('Fetched and transformed', transformed.length, 'conversations from cloud');
      return transformed;
    } catch (err) {
      console.error('fetchConversationsFromCloud error:', err.message);
      return [];
    } finally {
      fetchInProgress = null;
    }
  })();

  return fetchInProgress;
};

export const deleteConversationFromCloud = async (conversationId) => {
  const { error } = await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);

  if (error) {
    console.error('Error deleting conversation:', error);
  }
};

// Update user profile
export const updateProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .upsert({
      id: userId,
      ...updates,
      updated_at: new Date().toISOString(),
    });

  if (error) throw error;
  return data;
};

// Get user profile
export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    throw error;
  }
  return data;
};
