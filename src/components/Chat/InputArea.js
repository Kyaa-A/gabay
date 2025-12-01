import React, { useState, useRef } from "react";

const SUPPORTED_TYPES = {
  "image/jpeg": true,
  "image/png": true,
  "image/gif": true,
  "image/webp": true,
  "application/pdf": true,
  "text/plain": true,
};

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const InputArea = ({
  inputValue,
  onChange,
  onKeyPress,
  onSend,
  isDisabled,
  attachments = [],
  onAttachmentsChange,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const fileInputRef = useRef(null);

  const canSend = !isDisabled || attachments.length > 0;

  const validateFile = (file) => {
    if (!SUPPORTED_TYPES[file.type]) return { valid: false };
    if (file.size > MAX_FILE_SIZE) return { valid: false };
    return { valid: true };
  };

  const processFiles = async (files) => {
    const newAttachments = [];
    for (const file of files) {
      if (!validateFile(file).valid) continue;
      const base64 = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.readAsDataURL(file);
      });
      newAttachments.push({
        id: Date.now() + Math.random(),
        name: file.name,
        type: file.type,
        size: file.size,
        data: base64,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      });
    }
    if (newAttachments.length > 0 && onAttachmentsChange) {
      onAttachmentsChange([...attachments, ...newAttachments]);
    }
  };

  const handleDragOver = (e) => { e.preventDefault(); setIsDragOver(true); };
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragOver(false); };
  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) await processFiles(files);
  };

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) await processFiles(files);
    e.target.value = "";
  };

  const handleRemoveAttachment = (id) => {
    if (onAttachmentsChange) {
      const removed = attachments.find((a) => a.id === id);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      onAttachmentsChange(attachments.filter((a) => a.id !== id));
    }
  };

  return (
    <div
      className="no-drag"
      style={{
        padding: "16px 20px",
        backgroundColor: "#111827",
        borderTop: "1px solid rgba(55, 65, 81, 0.5)",
      }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,.pdf,.txt"
        onChange={handleFileSelect}
        style={{ display: "none" }}
      />

      {/* Attachment previews */}
      {attachments.length > 0 && (
        <div style={{ display: "flex", gap: "8px", marginBottom: "12px", flexWrap: "wrap" }}>
          {attachments.map((att) => (
            <div
              key={att.id}
              style={{
                position: "relative",
                background: "#1f2937",
                borderRadius: "8px",
                padding: "6px 10px",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                border: "1px solid #374151",
              }}
            >
              {att.preview ? (
                <img src={att.preview} alt="" style={{ width: "32px", height: "32px", borderRadius: "4px", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "32px", height: "32px", background: "#3b82f6", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "white", fontWeight: 600 }}>
                  {att.type.includes("pdf") ? "PDF" : "TXT"}
                </div>
              )}
              <span style={{ fontSize: "12px", color: "#9ca3af", maxWidth: "60px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.name}</span>
              <button
                onClick={() => handleRemoveAttachment(att.id)}
                style={{ position: "absolute", top: "-6px", right: "-6px", width: "18px", height: "18px", borderRadius: "50%", background: "#ef4444", border: "none", color: "white", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center" }}
              >×</button>
            </div>
          ))}
        </div>
      )}

      {/* Input row */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: "10px", position: "relative" }}>
        {isDragOver && (
          <div style={{ position: "absolute", inset: 0, background: "rgba(59, 130, 246, 0.1)", border: "2px dashed #3b82f6", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 10 }}>
            <span style={{ color: "#3b82f6", fontWeight: 500 }}>Drop files here</span>
          </div>
        )}

        {/* Input container */}
        <div
          style={{
            flex: 1,
            display: "flex",
            alignItems: "flex-end",
            background: "#1f2937",
            borderRadius: "16px",
            border: isFocused ? "2px solid #3b82f6" : "1px solid #374151",
            transition: "border-color 0.2s, border-width 0.2s",
            overflow: "hidden",
          }}
        >
          {/* Attach button */}
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: "40px",
              height: "40px",
              marginLeft: "4px",
              marginBottom: "4px",
              background: "transparent",
              border: "none",
              borderRadius: "8px",
              color: "#6b7280",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#3b82f6")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#6b7280")}
            title="Attach file"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          <textarea
            value={inputValue}
            onChange={onChange}
            onKeyPress={onKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Message Gabay..."
            style={{
              flex: 1,
              minHeight: "48px",
              maxHeight: "120px",
              padding: "14px 12px 14px 4px",
              background: "transparent",
              border: "none",
              color: "#f3f4f6",
              fontSize: "14px",
              lineHeight: "1.5",
              resize: "none",
              outline: "none",
            }}
            className="chat-input"
          />
        </div>

        {/* Send button */}
        <button
          onClick={onSend}
          disabled={!canSend}
          style={{
            width: "48px",
            height: "48px",
            background: canSend ? "#3b82f6" : "#374151",
            border: "none",
            borderRadius: "12px",
            color: "white",
            cursor: canSend ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => canSend && (e.currentTarget.style.background = "#2563eb")}
          onMouseLeave={(e) => canSend && (e.currentTarget.style.background = "#3b82f6")}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default InputArea;
