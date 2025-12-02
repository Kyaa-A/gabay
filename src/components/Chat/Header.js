import React from "react";
import GabayIcon from "../../Image/Whispr-no-bg.png";
import UserMenu from "../Auth/UserMenu";

const Header = ({ onClearChat, onToggleSidebar, onExport, onOpenAuth }) => {
  // Prevent double-click from maximizing
  const handleDoubleClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      onDoubleClick={handleDoubleClick}
      style={{
        padding: "12px 16px",
        backgroundColor: "#111827",
        borderBottom: "1px solid #1f2937",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        WebkitAppRegion: "drag",
        cursor: "move",
      }}
    >
      {/* Left: Menu button, Logo and Title */}
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {/* Sidebar toggle */}
        <button
          onClick={onToggleSidebar}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            backgroundColor: "transparent",
            border: "1px solid #374151",
            color: "#6b7280",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            WebkitAppRegion: "no-drag",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1f2937"; e.currentTarget.style.color = "#f9fafb"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
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

        {/* Export button */}
        <button
          onClick={onExport}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            backgroundColor: "transparent",
            border: "1px solid #374151",
            color: "#6b7280",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1f2937"; e.currentTarget.style.color = "#f9fafb"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
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
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            backgroundColor: "transparent",
            border: "1px solid #374151",
            color: "#6b7280",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1f2937"; e.currentTarget.style.color = "#f9fafb"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#6b7280"; }}
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
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            backgroundColor: "#eab308",
            border: "none",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#ca8a04")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#eab308")}
          title="Minimize"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M5 12h14" />
          </svg>
        </button>

        <button
          onClick={() => window.electronAPI?.closeWindow()}
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            backgroundColor: "#ef4444",
            border: "none",
            color: "white",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#dc2626")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#ef4444")}
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
