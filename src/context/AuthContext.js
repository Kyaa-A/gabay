import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  supabase,
  isSupabaseConfigured,
  signIn as supabaseSignIn,
  signUp as supabaseSignUp,
  signOut as supabaseSignOut,
  getProfile,
  updateProfile,
  syncConversationsToCloud,
  fetchConversationsFromCloud,
  deleteConversationFromCloud,
  testSupabaseConnection,
} from '../lib/supabase';
import {
  getConversations,
  saveConversations,
  setActiveConversationId,
} from '../utils/storage';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState(null); // Cache access token

  const isConfigured = isSupabaseConfigured();

  // Initialize auth state
  useEffect(() => {
    if (!isConfigured) {
      setLoading(false);
      return;
    }

    // Test Supabase connection first
    testSupabaseConnection().then(result => {
      console.log('Supabase connection test result:', result);
    });

    // Timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      console.log('Auth timeout - proceeding without session');
      setLoading(false);
    }, 5000); // 5 second timeout

    // Check for existing session
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          setUser(session.user);
          setAccessToken(session.access_token); // Cache access token
          console.log('Cached access token from init');
          // Fetch profile
          const userProfile = await getProfile(session.user.id);
          setProfile(userProfile);
        }
      } catch (err) {
        console.error('Auth init error:', err);
      } finally {
        clearTimeout(timeout);
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user);
          setAccessToken(session.access_token); // Cache access token
          console.log('Cached access token from auth change');
          const userProfile = await getProfile(session.user.id);
          setProfile(userProfile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          setAccessToken(null); // Clear access token
        }
      }
    );

    return () => {
      clearTimeout(timeout);
      subscription?.unsubscribe();
    };
  }, [isConfigured]);

  // Sign up new user
  const signUp = async (email, password, displayName) => {
    if (!isConfigured) {
      throw new Error('Supabase is not configured');
    }

    setError(null);
    try {
      const data = await supabaseSignUp(email, password, displayName);

      // Create profile
      if (data.user) {
        await updateProfile(data.user.id, {
          display_name: displayName,
          email: email,
        });
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  // Sign in existing user
  const signIn = async (email, password) => {
    console.log('=== signIn START ===');
    if (!isConfigured) {
      throw new Error('Supabase is not configured');
    }

    setError(null);
    try {
      console.log('signIn: Calling Supabase signIn...');
      const data = await supabaseSignIn(email, password);
      console.log('signIn: Supabase returned user:', data.user?.id);

      // Cache the access token immediately after sign in
      const token = data.session?.access_token;
      if (token) {
        setAccessToken(token);
        console.log('signIn: Cached access token');
      }

      // Sync conversations from cloud after login
      if (data.user) {
        console.log('signIn: User authenticated, calling syncFromCloud with token...');
        const conversations = await syncFromCloud(data.user.id, token);
        console.log('signIn: syncFromCloud returned', conversations?.length || 0, 'conversations');
      }

      console.log('=== signIn END ===');
      return data;
    } catch (err) {
      console.error('signIn ERROR:', err);
      setError(err.message);
      throw err;
    }
  };

  // Sign out
  const signOut = async (clearLocal = true) => {
    setError(null);
    console.log('Starting sign out, user:', user?.id);

    // Quick sync before logout (max 5 seconds)
    if (isConfigured && user) {
      try {
        const localConversations = getConversations();
        console.log('Syncing before logout:', localConversations.length, 'conversations');

        if (localConversations.length > 0) {
          const syncPromise = syncConversationsToCloud(user.id, localConversations);
          const result = await Promise.race([
            syncPromise,
            new Promise(resolve => setTimeout(() => resolve({ timeout: true }), 5000))
          ]);
          console.log('Pre-logout sync result:', result);
        }
      } catch (err) {
        console.error('Quick sync before logout failed:', err);
      }
    }

    // Now clear state
    setSyncing(false);
    setUser(null);
    setProfile(null);

    // Clear local storage
    if (clearLocal) {
      saveConversations([]);
      setActiveConversationId(null);
    }

    // Sign out from Supabase
    if (isConfigured) {
      supabaseSignOut().catch(err => {
        console.error('Supabase sign out error:', err);
      });
    }

    console.log('Sign out complete');
  };

  // Sync local conversations to cloud
  const syncToCloud = async (force = false) => {
    if (!isConfigured || !user) {
      console.log('Cannot sync: not configured or no user');
      return;
    }
    if (syncing && !force) {
      console.log('Already syncing, skipping');
      return;
    }

    setSyncing(true);
    try {
      const localConversations = getConversations();
      console.log('Starting sync with', localConversations.length, 'conversations');
      console.log('Using cached access token:', !!accessToken);

      // Add timeout to prevent infinite syncing
      // Pass the cached access token to avoid calling getSession()
      const syncPromise = syncConversationsToCloud(user.id, localConversations, accessToken);
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Sync timeout')), 10000)
      );

      const result = await Promise.race([syncPromise, timeoutPromise]);
      console.log('Sync result:', result);
      return result;
    } catch (err) {
      console.error('Sync to cloud error:', err);
    } finally {
      setSyncing(false);
    }
  };

  // Sync conversations from cloud to local
  const syncFromCloud = async (userId = user?.id, token = accessToken) => {
    console.log('=== syncFromCloud START ===');
    console.log('syncFromCloud called with userId:', userId);
    console.log('syncFromCloud using cached access token:', !!token);
    console.log('isConfigured:', isConfigured);
    console.log('syncing:', syncing);

    if (!isConfigured) {
      console.log('syncFromCloud: Supabase not configured, returning empty');
      return [];
    }

    if (!userId) {
      console.log('syncFromCloud: No userId provided, returning empty');
      return [];
    }

    // If already syncing, wait for it to complete
    if (syncing) {
      console.log('syncFromCloud: Already syncing, returning local');
      return getConversations();
    }

    setSyncing(true);
    try {
      // Fetch directly without additional timeout wrapper
      // (fetchConversationsFromCloud already has its own timeout)
      // Pass the cached access token to avoid calling getSession()
      console.log('syncFromCloud: Calling fetchConversationsFromCloud...');
      const cloudConversations = await fetchConversationsFromCloud(userId, token);
      console.log('syncFromCloud: fetchConversationsFromCloud returned:', cloudConversations);
      console.log('syncFromCloud: got', cloudConversations?.length || 0, 'from cloud');

      const localConversations = getConversations();
      console.log('syncFromCloud: got', localConversations?.length || 0, 'from local');

      // Merge: cloud takes precedence, but keep local-only conversations
      const mergedConversations = [...(cloudConversations || [])];
      const cloudIds = new Set((cloudConversations || []).map(c => c.id));

      for (const local of localConversations) {
        if (!cloudIds.has(local.id)) {
          console.log('syncFromCloud: Adding local-only conversation:', local.id);
          mergedConversations.push(local);
        }
      }

      // Sort by updated date
      mergedConversations.sort((a, b) =>
        new Date(b.updatedAt) - new Date(a.updatedAt)
      );

      console.log('syncFromCloud: merged total:', mergedConversations.length);
      if (mergedConversations.length > 0) {
        console.log('syncFromCloud: first conversation:', {
          id: mergedConversations[0].id,
          title: mergedConversations[0].title,
          messages: mergedConversations[0].messages?.length
        });
      }

      // Save merged to local
      console.log('syncFromCloud: Saving to localStorage...');
      saveConversations(mergedConversations);

      // Set active conversation to first one
      if (mergedConversations.length > 0) {
        setActiveConversationId(mergedConversations[0].id);
      }

      console.log('=== syncFromCloud END - returning', mergedConversations.length, 'conversations ===');
      return mergedConversations;
    } catch (err) {
      console.error('syncFromCloud ERROR:', err);
      // Return local conversations if cloud sync fails
      const localFallback = getConversations();
      console.log('syncFromCloud: Returning local fallback:', localFallback.length, 'conversations');
      return localFallback;
    } finally {
      setSyncing(false);
    }
  };

  // Delete conversation from cloud
  const deleteFromCloud = async (conversationId) => {
    if (!isConfigured || !user) return;

    try {
      await deleteConversationFromCloud(conversationId);
    } catch (err) {
      console.error('Delete from cloud error:', err);
    }
  };

  const value = {
    user,
    profile,
    loading,
    syncing,
    error,
    isConfigured,
    isAuthenticated: !!user,
    signUp,
    signIn,
    signOut,
    syncToCloud,
    syncFromCloud,
    deleteFromCloud,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
