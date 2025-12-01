import React from "react";
import Message from "./Message";
import GabayIcon from "../../Image/Whispr-no-bg.png";

const TypingIndicator = () => (
  <div style={{ display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "16px" }}>
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
      <img src={GabayIcon} alt="" style={{ width: "22px", height: "22px" }} />
    </div>
    <div
      style={{
        padding: "14px 18px",
        backgroundColor: "#1f2937",
        borderRadius: "4px 16px 16px 16px",
        display: "flex",
        gap: "4px",
      }}
    >
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          style={{
            width: "6px",
            height: "6px",
            borderRadius: "50%",
            backgroundColor: "#6b7280",
            animation: `pulse 1.4s ease-in-out ${i * 0.15}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes pulse {
          0%, 60%, 100% { opacity: 0.3; transform: scale(1); }
          30% { opacity: 1; transform: scale(1.2); }
        }
      `}</style>
    </div>
  </div>
);

const MessageList = ({ messages, isTyping, onOpenModal, messagesContainerRef, messagesEndRef, onScroll }) => (
  <div
    ref={messagesContainerRef}
    onScroll={onScroll}
    className="chat-scrollbar no-drag"
    style={{
      flex: 1,
      overflowY: "auto",
      overflowX: "hidden",
      padding: "20px",
      backgroundColor: "#0f172a",
    }}
  >
    {messages.map((msg) => (
      <Message key={msg.id} message={msg} onOpenModal={onOpenModal} />
    ))}
    {isTyping && <TypingIndicator />}
    <div ref={messagesEndRef} />
  </div>
);

export default MessageList;
