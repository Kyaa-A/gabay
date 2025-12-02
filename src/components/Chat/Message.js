import React, { useState } from "react";
import { isLongMessage, formatTime } from "../../utils/messageUtils";
import { formatText, getPlainText } from "../../utils/textFormatter";
import GabayIcon from "../../Image/Whispr-no-bg.png";

const copyToClipboard = async (text) => {
  // Method 1: Electron API
  try {
    if (window?.electronAPI?.writeText) {
      const result = window.electronAPI.writeText(text);
      if (result) return true;
    }
  } catch (e) {
    console.log("Electron clipboard failed:", e);
  }

  // Method 2: Navigator clipboard API
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {
    console.log("Navigator clipboard failed:", e);
  }

  // Method 3: Fallback using textarea
  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    const success = document.execCommand("copy");
    document.body.removeChild(textarea);
    if (success) return true;
  } catch (e) {
    console.log("Textarea fallback failed:", e);
  }

  return false;
};

const Message = ({
  message,
  onOpenModal,
  onEdit,
  onDelete,
  onRegenerate,
  isRegenerating
}) => {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const [showActions, setShowActions] = useState(false);

  const isBot = message.sender === "bot";
  const hasAttachments = message.attachments?.length > 0;

  const handleCopy = async () => {
    const ok = await copyToClipboard(getPlainText(message.text));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveEdit = () => {
    if (editText.trim() && editText !== message.text) {
      onEdit?.(message.id, editText.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditText(message.text);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  return (
    <div
      className="no-drag"
      style={{
        display: "flex",
        justifyContent: isBot ? "flex-start" : "flex-end",
        alignItems: hasAttachments ? "center" : "flex-start",
        marginBottom: "16px",
        gap: "10px",
        position: "relative",
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {/* Bot Avatar */}
      {isBot && (
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            backgroundColor: "#1f2937",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            alignSelf: hasAttachments ? "center" : "flex-start",
          }}
        >
          <img src={GabayIcon} alt="" style={{ width: "22px", height: "22px" }} />
        </div>
      )}

      {/* Message Bubble */}
      <div
        style={{
          maxWidth: "80%",
          padding: "12px 16px",
          borderRadius: isBot ? "4px 16px 16px 16px" : "16px 4px 16px 16px",
          backgroundColor: isBot ? "#1f2937" : "#3b82f6",
          color: "#f9fafb",
          position: "relative",
        }}
      >
        {/* Regenerating indicator */}
        {isRegenerating && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              borderRadius: "inherit",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: "12px",
            }}
          >
            Regenerating...
          </div>
        )}

        {/* Attachments */}
        {hasAttachments && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: message.text ? "10px" : 0 }}>
            {message.attachments.map((att) => (
              <div key={att.id} style={{ borderRadius: "8px", overflow: "hidden", backgroundColor: "rgba(0,0,0,0.2)" }}>
                {att.preview ? (
                  <img src={att.preview} alt="" style={{ maxWidth: "160px", maxHeight: "120px", display: "block" }} />
                ) : (
                  <div style={{ padding: "10px 14px", fontSize: "12px", color: "#d1d5db" }}>{att.name}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Text - Editable or Display */}
        {isEditing ? (
          <div>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              style={{
                width: "100%",
                minHeight: "60px",
                padding: "8px",
                backgroundColor: "#0f172a",
                border: "1px solid #3b82f6",
                borderRadius: "8px",
                color: "#f3f4f6",
                fontSize: "14px",
                lineHeight: 1.5,
                resize: "vertical",
                outline: "none",
              }}
            />
            <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
              <button
                onClick={handleSaveEdit}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#22c55e",
                  border: "none",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
              <button
                onClick={handleCancelEdit}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#6b7280",
                  border: "none",
                  borderRadius: "6px",
                  color: "white",
                  fontSize: "12px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          message.text && (
            <div style={{ fontSize: "14px", lineHeight: 1.6 }} className="message-body">
              {formatText(message.text)}
            </div>
          )
        )}

        {/* Footer - only show when not editing */}
        {!isEditing && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px", gap: "10px" }}>
            <span style={{ fontSize: "11px", color: isBot ? "#6b7280" : "rgba(255,255,255,0.7)" }}>
              {formatTime(message.timestamp)}
              {message.edited && <span style={{ marginLeft: "4px" }}>(edited)</span>}
            </span>

            <div style={{ display: "flex", gap: "6px" }}>
              {isBot && (
                <button
                  onClick={handleCopy}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: copied ? "#22c55e" : "#6b7280",
                    cursor: "pointer",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "11px",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {copied ? <polyline points="20 6 9 17 4 12" /> : <><rect x="9" y="9" width="10" height="10" rx="2" /><path d="M5 15V5a2 2 0 0 1 2-2h10" /></>}
                  </svg>
                  {copied ? "Copied" : "Copy"}
                </button>
              )}

              {isLongMessage(message.text) && !message.text.includes("```") && (
                <button
                  onClick={() => onOpenModal(message.text, isBot ? "Response" : "Message")}
                  style={{
                    background: "transparent",
                    border: "none",
                    color: "#6b7280",
                    cursor: "pointer",
                    padding: "4px",
                    fontSize: "11px",
                  }}
                >
                  Expand
                </button>
              )}
            </div>
          </div>
        )}

        {/* Hover Actions Menu */}
        {showActions && !isEditing && (
          <div
            style={{
              position: "absolute",
              top: "-36px",
              right: isBot ? "auto" : "0",
              left: isBot ? "0" : "auto",
              display: "flex",
              gap: "4px",
              backgroundColor: "#1f2937",
              padding: "6px 8px",
              borderRadius: "8px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
              zIndex: 10,
            }}
          >
            {/* Edit button - only for user messages */}
            {!isBot && (
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#6b7280",
                  cursor: "pointer",
                  padding: "4px 6px",
                  borderRadius: "4px",
                }}
                title="Edit message"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#374151")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              </button>
            )}

            {/* Regenerate button - only for bot messages */}
            {isBot && onRegenerate && (
              <button
                onClick={() => onRegenerate(message.id)}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#6b7280",
                  cursor: "pointer",
                  padding: "4px 6px",
                  borderRadius: "4px",
                }}
                title="Regenerate response"
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#374151")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M23 4v6h-6" />
                  <path d="M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
                </svg>
              </button>
            )}

            {/* Delete button */}
            <button
              onClick={() => onDelete?.(message.id)}
              style={{
                background: "transparent",
                border: "none",
                color: "#ef4444",
                cursor: "pointer",
                padding: "4px 6px",
                borderRadius: "4px",
              }}
              title="Delete message"
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#374151")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* User indicator */}
      {!isBot && (
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            backgroundColor: "#3b82f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: "11px",
            fontWeight: 600,
            color: "white",
            alignSelf: hasAttachments ? "center" : "flex-start",
          }}
        >
          You
        </div>
      )}
    </div>
  );
};

export default Message;
