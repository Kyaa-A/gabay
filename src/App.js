import React from 'react';
import ChatWindow from './components/ChatWindow';
import LoginScreen from './components/Auth/LoginScreen';
import { AuthProvider, useAuth } from './context/AuthContext';

const Landing = () => (
  <div className="w-screen h-screen bg-chat-bg text-white flex items-center justify-center">
    <div className="absolute inset-0 pointer-events-none opacity-10" style={{
      background: 'radial-gradient(800px 400px at 30% 40%, #3b82f6, transparent), radial-gradient(600px 300px at 80% 70%, #22c55e, transparent)'
    }} />
    <div className="relative w-full max-w-6xl px-10 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
      {/* Left: Big mascot / illustration */}
      <div className="flex items-center justify-center float-slow">
        <img
          src={require('./Image/Whispr-no-bg.png')}
          alt="Gabay"
          style={{ width: '75%', maxWidth: 520, minWidth: 260 }}
        />
      </div>

      {/* Right: Title and actions */}
      <div className="text-left justified-landing">
        <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">Gabay</h1>
        <p className="opacity-90 mb-6 text-lg md:text-xl leading-relaxed max-w-xl">
          Your personal AI chatbot for Windows. Get instant answers, boost productivity,
          and ship code faster — all from a beautiful always‑on desktop widget.
        </p>
        <ul className="space-y-2 opacity-90 mb-8 text-base">
          <li className="flex items-start gap-2"><span className="text-green-400">✓</span><span>One‑tap global hotkey to summon Gabay anywhere</span></li>
          <li className="flex items-start gap-2"><span className="text-green-400">✓</span><span>Under 50 MB portable build — no install required</span></li>
          <li className="flex items-start gap-2"><span className="text-green-400">✓</span><span>Smart formatting, code blocks, and copy‑to‑clipboard</span></li>
        </ul>
        <div className="flex flex-wrap items-center gap-4">
          {/* GitHub Releases download link */}
          <a
            href="https://github.com/Kyaa-A/gabay/releases/latest/download/Gabay.1.0.0.exe"
            download
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md text-lg shadow-md shadow-blue-900/30 flex items-center gap-2"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 5h16v4H4V5zm0 5h7v9H4v-9zm9 0h7v9h-7v-9z" />
            </svg>
            Download for Windows
          </a>
          <button
            className="bg-transparent border border-blue-500/60 text-blue-300 hover:bg-blue-600/20 px-6 py-3 rounded-md text-lg flex items-center gap-2 opacity-50 cursor-not-allowed"
            disabled
            title="Coming soon"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.365 1.43c0 1.14-.47 2.205-1.227 3.055-.784.88-2.117 1.55-3.24 1.46-.14-1.1.42-2.26 1.175-3.08.79-.87 2.197-1.49 3.292-1.435zM20.5 17.152c-.64 1.49-1.42 2.98-2.56 4.39-1 .13-1.99-.07-2.87-.42-.79-.31-1.52-.74-2.33-.74-.85 0-1.61.43-2.43.74-.92.35-1.87.55-2.89.41-1.16-1.43-1.99-2.99-2.63-4.52-.73-1.72-1.1-3.4-1.1-4.54 0-1.84.62-3.32 1.87-4.38.89-.76 2.03-1.2 3.21-1.18.88.02 1.72.32 2.48.64.67.28 1.39.62 1.86.62.41 0 1.2-.37 1.93-.66.81-.33 1.63-.54 2.44-.51 1.83.05 3.31.75 4.2 1.92-1.76 1.05-2.6 2.7-2.6 4.96 0 1.28.35 2.62 1.05 4.03z"/>
            </svg>
            Download for Mac
          </button>
        </div>
        <p className="mt-3 text-xs opacity-60">Runs on Windows 10/11. Requires internet for AI replies.</p>
      </div>
    </div>
    <div className="landing-footer">
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-3">
        <span className="opacity-70">Built with</span>
        <span className="text-red-400">♥</span>
        <span className="opacity-70">by</span>
        <a href="https://www.asnari.tech/" target="_blank" rel="noopener noreferrer" className="text-chat-primary hover:underline font-medium">Asnari</a>
      </div>
    </div>
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
