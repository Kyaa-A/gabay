import React from 'react';
import ChatWindow from './components/ChatWindow';
import LoginScreen from './components/Auth/LoginScreen';
import { AuthProvider, useAuth } from './context/AuthContext';

const Landing = () => (
  <div className="w-screen h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center relative overflow-hidden">
    {/* Animated background gradients */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-96 h-96 bg-green-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
    </div>

    {/* Grid pattern overlay */}
    <div
      className="absolute inset-0 pointer-events-none opacity-5"
      style={{
        backgroundImage: `linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)`,
        backgroundSize: '50px 50px'
      }}
    />

    <div className="relative w-full max-w-7xl px-6 md:px-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center z-10">
      {/* Left: Big mascot / illustration */}
      <div className="flex flex-col items-center justify-center space-y-8">
        <div className="relative float-slow">
          <div className="absolute inset-0 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <img
            src={require('./Image/Whispr-no-bg.png')}
            alt="Gabay"
            className="relative z-10 drop-shadow-2xl"
            style={{ width: '80%', maxWidth: 480, minWidth: 240, margin: '0 auto' }}
          />
        </div>
        {/* Feature badges */}
        <div className="flex flex-wrap justify-center gap-3">
          <span className="px-4 py-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full text-sm font-medium text-slate-300 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
            Always-On-Top
          </span>
          <span className="px-4 py-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full text-sm font-medium text-slate-300 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
            Cloud Sync
          </span>
          <span className="px-4 py-2 bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-full text-sm font-medium text-slate-300 flex items-center gap-2">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
            Portable
          </span>
        </div>
      </div>

      {/* Right: Title and actions */}
      <div className="text-left space-y-6">
        <div className="space-y-3">
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-blue-100 to-white">
            Gabay
          </h1>
          <p className="text-slate-400 text-xl md:text-2xl leading-relaxed max-w-xl font-light">
            Your personal AI chatbot for Windows. Get instant answers, boost productivity,
            and ship code faster — all from a beautiful always‑on desktop widget.
          </p>
        </div>

        <ul className="space-y-3">
          <li className="flex items-start gap-3 text-slate-300 text-base group">
            <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/30 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span>One‑tap global hotkey to summon Gabay anywhere</span>
          </li>
          <li className="flex items-start gap-3 text-slate-300 text-base group">
            <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/30 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span>Lightweight portable build — no install required</span>
          </li>
          <li className="flex items-start gap-3 text-slate-300 text-base group">
            <div className="mt-1 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500/30 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            </div>
            <span>Smart formatting, code blocks, and copy‑to‑clipboard</span>
          </li>
        </ul>

        <div className="flex flex-wrap items-center gap-4 pt-4">
          {/* GitHub Releases download link */}
          <a
            href="https://github.com/Kyaa-A/gabay/releases/latest/download/Gabay.1.0.0.exe"
            download
            className="group relative bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-xl shadow-blue-900/40 flex items-center gap-3 transition-all hover:scale-105 hover:shadow-2xl hover:shadow-blue-900/50"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 5h16v4H4V5zm0 5h7v9H4v-9zm9 0h7v9h-7v-9z" />
            </svg>
            Download for Windows
            <svg className="group-hover:translate-x-1 transition-transform" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </a>
          <button
            className="bg-slate-800/30 backdrop-blur-sm border-2 border-slate-700/50 text-slate-400 px-8 py-4 rounded-xl text-lg font-semibold flex items-center gap-3 opacity-50 cursor-not-allowed"
            disabled
            title="Coming soon"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M16.365 1.43c0 1.14-.47 2.205-1.227 3.055-.784.88-2.117 1.55-3.24 1.46-.14-1.1.42-2.26 1.175-3.08.79-.87 2.197-1.49 3.292-1.435zM20.5 17.152c-.64 1.49-1.42 2.98-2.56 4.39-1 .13-1.99-.07-2.87-.42-.79-.31-1.52-.74-2.33-.74-.85 0-1.61.43-2.43.74-.92.35-1.87.55-2.89.41-1.16-1.43-1.99-2.99-2.63-4.52-.73-1.72-1.1-3.4-1.1-4.54 0-1.84.62-3.32 1.87-4.38.89-.76 2.03-1.2 3.21-1.18.88.02 1.72.32 2.48.64.67.28 1.39.62 1.86.62.41 0 1.2-.37 1.93-.66.81-.33 1.63-.54 2.44-.51 1.83.05 3.31.75 4.2 1.92-1.76 1.05-2.6 2.7-2.6 4.96 0 1.28.35 2.62 1.05 4.03z"/>
            </svg>
            Coming Soon
          </button>
        </div>
        <p className="text-sm text-slate-500">Runs on Windows 10/11. Requires internet for AI replies.</p>
      </div>
    </div>

    {/* Footer */}
    <div className="absolute bottom-0 left-0 right-0 py-8 border-t border-slate-800/50 backdrop-blur-sm bg-slate-950/30">
      <div className="max-w-7xl mx-auto px-6 flex flex-wrap items-center justify-center gap-3 text-sm">
        <span className="text-slate-400">Built with</span>
        <span className="text-red-400 animate-pulse">♥</span>
        <span className="text-slate-400">by</span>
        <a href="https://www.asnari.tech/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 font-medium hover:underline transition-colors">Asnari</a>
      </div>
    </div>

    {/* Add animations CSS */}
    <style>{`
      @keyframes blob {
        0%, 100% { transform: translate(0px, 0px) scale(1); }
        33% { transform: translate(30px, -50px) scale(1.1); }
        66% { transform: translate(-20px, 20px) scale(0.9); }
      }
      .animate-blob {
        animation: blob 7s infinite;
      }
      .animation-delay-2000 {
        animation-delay: 2s;
      }
      .animation-delay-4000 {
        animation-delay: 4s;
      }
    `}</style>
  </div>
);

// Main app content that requires auth
const AppContent = () => {
  const { isAuthenticated, loading, isConfigured } = useAuth();

  // Show loading while checking auth
  if (loading) {
    return (
      <div
        style={{
          width: '100vw',
          height: '100vh',
          backgroundColor: '#0f172a',
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6b7280',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '24px',
            height: '24px',
            border: '3px solid #374151',
            borderTopColor: '#3b82f6',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <span style={{ fontSize: '13px' }}>Loading...</span>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // If Supabase not configured, allow guest access
  if (!isConfigured) {
    return <ChatWindow />;
  }

  // Require login
  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  // Authenticated - show chat
  return <ChatWindow />;
};

function App() {
  // Detect Electron renderer reliably (preload exposes electronAPI; userAgent also contains 'Electron')
  const isElectron = Boolean(typeof window !== 'undefined' && window.electronAPI) || /Electron/i.test(navigator.userAgent || '');
  return isElectron ? (
    <AuthProvider>
      <div className="App h-screen w-screen bg-chat-bg overflow-hidden m-0 p-0">
        <AppContent />
      </div>
    </AuthProvider>
  ) : (
    <Landing />
  );
}

export default App;
