import React from "react";

const ScrollToBottomButton = ({ isVisible, onClick }) => {
  if (!isVisible) return null;

  return (
    <div
      className="no-drag"
      style={{
        position: "absolute",
        right: "24px",
        bottom: "100px",
        zIndex: 10,
      }}
    >
      <button
        onClick={onClick}
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "10px",
          backgroundColor: "#1f2937",
          border: "1px solid #374151",
          color: "#9ca3af",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#374151"; e.currentTarget.style.color = "#f9fafb"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#1f2937"; e.currentTarget.style.color = "#9ca3af"; }}
        title="Scroll to bottom"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    </div>
  );
};

export default ScrollToBottomButton;
