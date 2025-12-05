import React from "react";
import GabayIcon from "../../Image/Whispr-no-bg.png";
import UserMenu from "../Auth/UserMenu";

const Header = ({ onClearChat, onToggleSidebar, onExport, onOpenAuth, onOpenSettings }) => {
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
        padding: "14px 18px",
        background: "linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.95) 100%)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(255, 255, 255, 0.05)",
        borderTopLeftRadius: "20px",
        borderTopRightRadius: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        WebkitAppRegion: "drag",
        cursor: "move",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
      }}
    >
      {/* Left: Menu button, Logo and Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Sidebar toggle */}
        <button
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
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            backgroundColor: "#1f2937",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img src={GabayIcon} alt="Gabay" style={{ width: "26px", height: "26px" }} />
        </div>
        <div>
          <h1 style={{ fontSize: "16px", fontWeight: 600, margin: 0, color: "#f9fafb" }}>
            Gabay
          </h1>
          <span style={{ fontSize: "11px", color: "#6b7280" }}>AI Assistant</span>
        </div>
      </div>

      {/* Right: Actions */}
      <div style={{ display: "flex", alignItems: "center", gap: "6px", WebkitAppRegion: "no-drag" }}>
        {/* User Menu / Sign In */}
        <UserMenu onOpenAuth={onOpenAuth} />

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          style={buttonStyle}
          onMouseEnter={buttonHoverEnter}
          onMouseLeave={buttonHoverLeave}
          title="Settings"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </button>

        {/* Export button */}
        <button
          onClick={onExport}
          style={buttonStyle}
          onMouseEnter={buttonHoverEnter}
          onMouseLeave={buttonHoverLeave}
          title="Export chat (Ctrl+E)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>

        <button
          onClick={onClearChat}
          style={buttonStyle}
          onMouseEnter={buttonHoverEnter}
          onMouseLeave={buttonHoverLeave}
          title="Clear chat"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
        </button>

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
          title="Minimize"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M5 12h14" />
          </svg>
        </button>

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
