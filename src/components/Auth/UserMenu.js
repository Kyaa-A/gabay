import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const UserMenu = ({ onOpenAuth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, isAuthenticated, isConfigured, syncing, signOut, syncToCloud } = useAuth();

  // If Supabase is not configured, don't show anything
  if (!isConfigured) {
    return null;
  }

  const handleSignOut = async () => {
    setIsOpen(false); // Close menu immediately
    try {
      await signOut();
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const handleSync = async () => {
    try {
      await syncToCloud();
    } catch (err) {
      console.error('Sync error:', err);
    }
  };

  // Not logged in - show login button
  if (!isAuthenticated) {
    return (
      <button
        onClick={onOpenAuth}
        style={{
          padding: '6px 12px',
          backgroundColor: 'transparent',
          border: '1px solid #374151',
          borderRadius: '8px',
          color: '#9ca3af',
          fontSize: '12px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#1f2937';
          e.currentTarget.style.color = '#f9fafb';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'transparent';
          e.currentTarget.style.color = '#9ca3af';
        }}
        title="Sign in to sync your chats"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
        Sign In
      </button>
    );
  }

  // Logged in - show user menu
  const displayName = profile?.display_name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: '#3b82f6',
          border: 'none',
          color: 'white',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}
        title={displayName}
      >
        {initials}
        {syncing && (
          <div
            style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '10px',
              height: '10px',
              backgroundColor: '#22c55e',
              borderRadius: '50%',
              border: '2px solid #111827',
              animation: 'pulse 1s ease-in-out infinite',
            }}
          />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99,
            }}
            onClick={() => setIsOpen(false)}
          />

          <div
            style={{
              position: 'absolute',
              top: '40px',
              right: 0,
              width: '200px',
              backgroundColor: '#1f2937',
              borderRadius: '12px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
              border: '1px solid #374151',
              padding: '8px',
              zIndex: 100,
              pointerEvents: 'auto',
            }}
          >
            {/* User Info */}
            <div
              style={{
                padding: '10px 12px',
                borderBottom: '1px solid #374151',
                marginBottom: '8px',
              }}
            >
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#f9fafb' }}>
                {displayName}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                {user?.email}
              </div>
            </div>

            {/* Sync Button */}
            <button
              onClick={handleSync}
              disabled={syncing}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: syncing ? '#6b7280' : '#f9fafb',
                fontSize: '13px',
                cursor: syncing ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => !syncing && (e.currentTarget.style.backgroundColor = '#374151')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                style={{
                  animation: syncing ? 'spin 1s linear infinite' : 'none',
                }}
              >
                <path d="M23 4v6h-6" />
                <path d="M1 20v-6h6" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
              {syncing ? 'Syncing...' : 'Sync Now'}
            </button>

            {/* Sign Out */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleSignOut();
              }}
              style={{
                width: '100%',
                padding: '10px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                borderRadius: '8px',
                color: '#ef4444',
                fontSize: '13px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                textAlign: 'left',
                pointerEvents: 'auto',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#374151')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              Sign Out
            </button>
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default UserMenu;
