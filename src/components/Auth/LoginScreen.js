import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import GabayIcon from '../../Image/Whispr-no-bg.png';

const LoginScreen = () => {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [success, setSuccess] = useState('');

  const { signIn, signUp, error: authError, clearError } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setSuccess('');
    clearError();

    if (!email || !password) {
      setLocalError('Please fill in all required fields');
      return;
    }

    if (mode === 'register' && !displayName) {
      setLocalError('Please enter your name');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
      } else {
        await signUp(email, password, displayName);
        setSuccess('Account created successfully!');
        setTimeout(() => {
          setMode('login');
          setSuccess('');
        }, 2000);
      }
    } catch (err) {
      setLocalError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setLocalError('');
    setSuccess('');
    clearError();
  };

  const error = localError || authError;

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: '#0f172a',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Draggable header area for moving the window */}
      <div
        style={{
          position: 'absolute',
          top: '8px',
          left: '8px',
          right: '80px',
          height: '36px',
          WebkitAppRegion: 'drag',
          zIndex: 5,
          cursor: 'move',
        }}
      />

      {/* Window controls - top right */}
      <div
        className="no-drag"
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          display: 'flex',
          gap: '6px',
          zIndex: 10,
          WebkitAppRegion: 'no-drag',
        }}
      >
        <button
          onClick={() => window.electronAPI?.minimizeWindow()}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: '#eab308',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ca8a04')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#eab308')}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 12h14" />
          </svg>
        </button>
        <button
          onClick={() => window.electronAPI?.closeWindow()}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '8px',
            backgroundColor: '#ef4444',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#dc2626')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ef4444')}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Main content - centered */}
      <div
        className="no-drag"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px 24px',
          overflowY: 'auto',
        }}
      >
        {/* Logo + Title row - more compact */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#1f2937',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <img src={GabayIcon} alt="Gabay" style={{ width: '36px', height: '36px' }} />
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, color: '#f9fafb' }}>
              Gabay
            </h1>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
              Your AI Assistant
            </p>
          </div>
        </div>

        {/* Form Card */}
        <div
          style={{
            width: '100%',
            maxWidth: '280px',
            backgroundColor: '#111827',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #1f2937',
          }}
        >
          <h2 style={{ margin: '0 0 2px', fontSize: '16px', fontWeight: 600, color: '#f9fafb', textAlign: 'center' }}>
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p style={{ margin: '0 0 12px', fontSize: '11px', color: '#6b7280', textAlign: 'center' }}>
            {mode === 'login' ? 'Sign in to continue' : 'Sign up to get started'}
          </p>

          {/* Error Message */}
          {error && (
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                borderRadius: '6px',
                marginBottom: '12px',
                fontSize: '12px',
                color: '#ef4444',
              }}
            >
              {error}
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div
              style={{
                padding: '8px 12px',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid rgba(34, 197, 94, 0.3)',
                borderRadius: '6px',
                marginBottom: '12px',
                fontSize: '12px',
                color: '#22c55e',
              }}
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Name field - only for register */}
            {mode === 'register' && (
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#9ca3af', marginBottom: '3px' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    backgroundColor: '#1f2937',
                    border: '1px solid #374151',
                    borderRadius: '6px',
                    color: '#f3f4f6',
                    fontSize: '13px',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                  onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                  onBlur={(e) => (e.target.style.borderColor = '#374151')}
                />
              </div>
            )}

            {/* Email field */}
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#9ca3af', marginBottom: '3px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#f3f4f6',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                onBlur={(e) => (e.target.style.borderColor = '#374151')}
              />
            </div>

            {/* Password field */}
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '11px', fontWeight: 500, color: '#9ca3af', marginBottom: '3px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  backgroundColor: '#1f2937',
                  border: '1px solid #374151',
                  borderRadius: '6px',
                  color: '#f3f4f6',
                  fontSize: '13px',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={(e) => (e.target.style.borderColor = '#3b82f6')}
                onBlur={(e) => (e.target.style.borderColor = '#374151')}
              />
            </div>

            {/* Submit button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '9px',
                backgroundColor: isLoading ? '#374151' : '#3b82f6',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '13px',
                fontWeight: 500,
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#2563eb')}
              onMouseLeave={(e) => !isLoading && (e.currentTarget.style.backgroundColor = '#3b82f6')}
            >
              {isLoading ? (
                <>
                  <span
                    style={{
                      width: '14px',
                      height: '14px',
                      border: '2px solid rgba(255,255,255,0.3)',
                      borderTopColor: 'white',
                      borderRadius: '50%',
                      animation: 'spin 0.8s linear infinite',
                    }}
                  />
                  {mode === 'login' ? 'Signing in...' : 'Creating...'}
                </>
              ) : (
                mode === 'login' ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>

          {/* Toggle mode link */}
          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <span style={{ fontSize: '11px', color: '#6b7280' }}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
            </span>
            <button
              onClick={toggleMode}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                fontSize: '11px',
                fontWeight: 500,
                cursor: 'pointer',
                padding: 0,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
            >
              {mode === 'login' ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginScreen;
