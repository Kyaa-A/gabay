import React, { useState, useEffect, useRef } from "react";

const Sidebar = ({
  conversations,
  activeId,
  onSelect,
  onNewChat,
  onDelete,
  onRename,
  onPin,
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  toggleButtonRef,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const sidebarRef = useRef(null);

  // Close sidebar when clicking outside (but not on the toggle button)
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      // Ignore clicks on the toggle button - let it handle its own toggle
      if (toggleButtonRef?.current?.contains(e.target)) {
        return;
      }
      // Ignore clicks inside the sidebar
      if (sidebarRef.current && sidebarRef.current.contains(e.target)) {
        return;
      }
      // Close only if clicking outside
      onClose();
    };

    // Use click event (not mousedown) so button handlers fire first
    // Small delay to prevent immediate close on the same click that opened it
    const timer = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 150);

    return () => {
      clearTimeout(timer);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, onClose, toggleButtonRef]);

  const handleSaveEdit = (id) => {
    const trimmedTitle = editTitle.trim();
    if (trimmedTitle) {
      onRename(id, trimmedTitle);
    }
    setEditingId(null);
    setEditTitle("");
  };

  const handleKeyDown = (e, id) => {
    if (e.key === "Enter") {
      handleSaveEdit(id);
    } else if (e.key === "Escape") {
      setEditingId(null);
      setEditTitle("");
    }
  };

  return (
    <div
      ref={sidebarRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "280px",
        height: "100%",
        backgroundColor: "#0a0f1a",
        borderRight: "1px solid #1f2937",
        display: "flex",
        flexDirection: "column",
        zIndex: 2000,
        transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        pointerEvents: isOpen ? "auto" : "none",
        WebkitAppRegion: "no-drag",
      }}
    >
      {/* Top area with hamburger button */}
      <div
        style={{
          padding: "14px 16px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          borderBottom: "1px solid #1f2937",
        }}
      >
        {/* Hamburger button to close */}
        <button
          onClick={onClose}
          style={{
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
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.color = "#f9fafb";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
            e.currentTarget.style.color = "#9ca3af";
          }}
          title="Close sidebar"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M3 12h18M3 6h18M3 18h18" />
          </svg>
        </button>
        <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 600, color: "#f9fafb" }}>
          Conversations
        </h2>
      </div>

      {/* New Chat Button */}
      <div style={{ padding: "12px 16px" }}>
        <button
          onClick={onNewChat}
          style={{
            width: "100%",
            padding: "10px 16px",
            backgroundColor: "#3b82f6",
            border: "none",
            borderRadius: "8px",
            color: "white",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "8px",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#2563eb")}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#3b82f6")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Search */}
      <div style={{ padding: "0 16px 12px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            backgroundColor: "#1f2937",
            borderRadius: "8px",
            padding: "8px 12px",
            border: "1px solid #374151",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              color: "#f3f4f6",
              fontSize: "13px",
              marginLeft: "8px",
            }}
          />
        </div>
      </div>

      {/* Conversation List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "0 8px",
        }}
        className="chat-scrollbar"
      >
        {conversations.length === 0 ? (
          <div style={{ padding: "20px", textAlign: "center", color: "#6b7280", fontSize: "13px" }}>
            No conversations yet
          </div>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={(e) => {
                // Only select if clicking on the row itself, not action buttons
                if (e.target.closest('[data-action]')) return;
                onSelect(conv.id);
              }}
              style={{
                padding: "12px",
                marginBottom: "4px",
                borderRadius: "8px",
                backgroundColor: conv.id === activeId ? "#1f2937" : "transparent",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "8px",
                transition: "background-color 0.15s",
                WebkitAppRegion: "no-drag",
              }}
              onMouseEnter={(e) => {
                if (conv.id !== activeId) {
                  e.currentTarget.style.backgroundColor = "#111827";
                }
              }}
              onMouseLeave={(e) => {
                if (conv.id !== activeId) {
                  e.currentTarget.style.backgroundColor = "transparent";
                }
              }}
            >
              {editingId === conv.id ? (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, conv.id)}
                    autoFocus
                    style={{
                      flex: 1,
                      background: "#0f172a",
                      border: "2px solid #3b82f6",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      color: "#f3f4f6",
                      fontSize: "13px",
                      outline: "none",
                      minWidth: 0,
                    }}
                  />
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSaveEdit(conv.id)}
                    style={{
                      background: "#3b82f6",
                      border: "none",
                      borderRadius: "6px",
                      color: "white",
                      padding: "8px 14px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    Save
                  </div>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setEditingId(null);
                      setEditTitle("");
                    }}
                    style={{
                      background: "#374151",
                      border: "none",
                      borderRadius: "6px",
                      color: "#9ca3af",
                      padding: "8px 12px",
                      cursor: "pointer",
                      fontSize: "12px",
                      fontWeight: 500,
                    }}
                  >
                    ✕
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: "13px",
                        fontWeight: conv.id === activeId ? 500 : 400,
                        color: "#f3f4f6",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      {conv.pinned && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="#fbbf24" stroke="#fbbf24" strokeWidth="2">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      )}
                      {conv.title}
                    </div>
                    <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Actions - always visible */}
                  <div style={{ display: "flex", gap: "4px", flexShrink: 0 }}>
                    {/* Pin Button */}
                    <div
                      data-action="pin"
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onPin(conv.id);
                      }}
                      style={{
                        background: conv.pinned ? "rgba(251, 191, 36, 0.15)" : "transparent",
                        border: "none",
                        color: conv.pinned ? "#fbbf24" : "#9ca3af",
                        cursor: "pointer",
                        padding: "8px",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: "32px",
                        minHeight: "32px",
                      }}
                      title={conv.pinned ? "Unpin" : "Pin"}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill={conv.pinned ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" style={{ pointerEvents: "none" }}>
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </div>
                    {/* Edit Button */}
                    <div
                      data-action="edit"
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingId(conv.id);
                        setEditTitle(conv.title);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#9ca3af",
                        cursor: "pointer",
                        padding: "8px",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: "32px",
                        minHeight: "32px",
                      }}
                      title="Rename"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ pointerEvents: "none" }}>
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                    </div>
                    {/* Delete Button */}
                    <div
                      data-action="delete"
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(conv.id);
                      }}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "#9ca3af",
                        cursor: "pointer",
                        padding: "8px",
                        borderRadius: "6px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: "32px",
                        minHeight: "32px",
                      }}
                      title="Delete"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ pointerEvents: "none" }}>
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {/* Keyboard shortcuts hint */}
      <div
        style={{
          padding: "12px 16px",
          borderTop: "1px solid #1f2937",
          fontSize: "11px",
          color: "#6b7280",
        }}
      >
        <div>Ctrl+N: New Chat</div>
        <div>Ctrl+F: Search</div>
        <div>Ctrl+E: Export</div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
};

export default Sidebar;
