import React, { useState } from "react";
import { isLongMessage, formatTime } from "../../utils/messageUtils";
import { formatText, getPlainText } from "../../utils/textFormatter";
import GabayIcon from "../../Image/Whispr-no-bg.png";

const copyToClipboard = async (text) => {
  try {
    if (window?.electronAPI?.writeText) {
      return window.electronAPI.writeText(text);
    }
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

const Message = ({ message, onOpenModal }) => {
  const [copied, setCopied] = useState(false);
  const isBot = message.sender === "bot";
  const hasAttachments = message.attachments?.length > 0;

  const handleCopy = async () => {
    const ok = await copyToClipboard(getPlainText(message.text));
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
      }}
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
        }}
      >
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

        {/* Text */}
        {message.text && (
          <div style={{ fontSize: "14px", lineHeight: 1.6 }} className="message-body">
            {formatText(message.text)}
          </div>
        )}

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "8px", gap: "10px" }}>
          <span style={{ fontSize: "11px", color: isBot ? "#6b7280" : "rgba(255,255,255,0.7)" }}>
            {formatTime(message.timestamp)}
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
