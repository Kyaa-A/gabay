import React, { useState, useRef, useEffect } from "react";
import GabayIcon from "../../Image/Whispr-no-bg.png";
import UserMenu from "../Auth/UserMenu";

const Header = ({ onClearChat, onToggleSidebar, onExport, onOpenAuth, onOpenSettings, onOpenPersonality, sidebarToggleRef }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  // Prevent double-click from maximizing
  const handleDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Modern button base style
  const buttonStyle = {
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    backgroundColor: "rgba(255, 255, 255, 0.05)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    color: "#9ca3af",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    WebkitAppRegion: "no-drag",
    transition: "all 0.2s ease",
  };

  const buttonHoverEnter = (e) => {
    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
    e.currentTarget.style.color = "#f9fafb";
    e.currentTarget.style.transform = "scale(1.05)";
  };

  const buttonHoverLeave = (e) => {
    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
    e.currentTarget.style.color = "#9ca3af";
    e.currentTarget.style.transform = "scale(1)";
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      style={{
        padding: "12px 16px",
        background: "linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        WebkitAppRegion: "drag",
        cursor: "move",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
        position: "relative",
        zIndex: 1000,
      }}
    >
      {/* Left: Menu button, Logo and Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Sidebar toggle */}
        <button
          ref={sidebarToggleRef}
          onClick={onToggleSidebar}
          style={buttonStyle}
          onMouseEnter={buttonHoverEnter}
          onMouseLeave={buttonHoverLeave}
          title="Conversations (Ctrl+B)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>

        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            backgroundColor: "#1f2937",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img src={GabayIcon} alt="Gabay" style={{ width: "22px", height: "22px" }} />
        </div>
        <h1 style={{ fontSize: "15px", fontWeight: 600, margin: 0, color: "#f9fafb" }}>
          Gabay
        </h1>
      </div>

      {/* Right: Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", WebkitAppRegion: "no-drag" }}>
        {/* User Menu / Sign In */}
        <UserMenu onOpenAuth={onOpenAuth} />

        {/* More menu (3 dots) */}
        <div ref={menuRef} style={{ position: "relative" }}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={buttonStyle}
            onMouseEnter={buttonHoverEnter}
            onMouseLeave={buttonHoverLeave}
            title="More options"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="2" />
              <circle cx="12" cy="12" r="2" />
              <circle cx="12" cy="19" r="2" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                marginTop: "6px",
                backgroundColor: "#1f2937",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                borderRadius: "10px",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                minWidth: "160px",
                overflow: "hidden",
                zIndex: 1001,
              }}
            >
              <button
                onClick={() => { onOpenSettings(); setMenuOpen(false); }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#d1d5db",
                  cursor: "pointer",
                  fontSize: "13px",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                </svg>
                Settings
              </button>
              <button
                onClick={() => { onOpenPersonality?.(); setMenuOpen(false); }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#d1d5db",
                  cursor: "pointer",
                  fontSize: "13px",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                AI Personality
              </button>
              <button
                onClick={() => { onExport(); setMenuOpen(false); }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#d1d5db",
                  cursor: "pointer",
                  fontSize: "13px",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(255,255,255,0.05)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export Chat
              </button>
              <div style={{ height: "1px", backgroundColor: "rgba(255,255,255,0.1)", margin: "4px 0" }} />
              <button
                onClick={() => { onClearChat(); setMenuOpen(false); }}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  backgroundColor: "transparent",
                  border: "none",
                  color: "#f87171",
                  cursor: "pointer",
                  fontSize: "13px",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "rgba(239,68,68,0.1)"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
                Clear Chat
              </button>
            </div>
          )}
        </div>

        {/* Minimize */}
        <button
          onClick={() => window.electronAPI?.minimizeWindow()}
          style={{
            ...buttonStyle,
            backgroundColor: "rgba(234, 179, 8, 0.15)",
            border: "1px solid rgba(234, 179, 8, 0.3)",
            color: "#fbbf24",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(234, 179, 8, 0.25)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(234, 179, 8, 0.15)";
            e.currentTarget.style.transform = "scale(1)";
          }}
          title="Minimize (Ctrl+L)"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M5 12h14" />
          </svg>
        </button>

        {/* Close */}
        <button
          onClick={() => window.electronAPI?.closeWindow()}
          style={{
            ...buttonStyle,
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            color: "#f87171",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.25)";
            e.currentTarget.style.transform = "scale(1.05)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.15)";
            e.currentTarget.style.transform = "scale(1)";
          }}
          title="Close"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Header;
