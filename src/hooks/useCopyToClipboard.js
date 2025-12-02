import { UI_CONFIG } from "../constants/initialMessages";

export const useCopyToClipboard = () => {
  const copyToClipboard = async (textToCopy) => {
    if (!textToCopy || textToCopy.trim() === "") {
      console.error("No content to copy");
      return { success: false, method: "no-content" };
    }

    console.log("Attempting to copy:", textToCopy.substring(0, 100) + "...");

    // Method 1: Try Electron clipboard API (most reliable in Electron)
    try {
      if (window.electronAPI && window.electronAPI.writeText) {
        console.log("Using Electron clipboard API");
        const result = window.electronAPI.writeText(textToCopy);
        if (result) {
          console.log("Electron clipboard success");
          return { success: true, method: "electron" };
        }
      }
    } catch (e) {
      console.log("Electron clipboard failed:", e);
    }

    // Method 2: Try modern clipboard API
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        console.log("Using modern clipboard API");
        await navigator.clipboard.writeText(textToCopy);
        return { success: true, method: "modern" };
      }
    } catch (e) {
      console.log("Modern clipboard failed:", e);
    }

    // Method 3: Create textarea and use execCommand
    try {
      console.log("Using textarea fallback method");
      const textArea = document.createElement("textarea");
      textArea.value = textToCopy;

      // Position off-screen but still focusable
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      textArea.style.top = "-9999px";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      textArea.setSelectionRange(0, textArea.value.length);

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);

      if (successful) {
        console.log("Copy successful using execCommand");
        return { success: true, method: "execCommand" };
      }
    } catch (e) {
      console.log("Textarea fallback failed:", e);
    }

    // Method 4: Try to select the modal content directly
    try {
      const modalContent = document.querySelector(".modal-content-text");
      if (modalContent) {
        console.log("Attempting to select modal content directly");
        const range = document.createRange();
        range.selectNodeContents(modalContent);
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        const copySuccess = document.execCommand("copy");
        selection.removeAllRanges();

        if (copySuccess) {
          return { success: true, method: "direct-selection" };
        }
      }
    } catch (e) {
      console.error("Direct selection also failed:", e);
    }

    return { success: false, method: "all-failed" };
  };

  const showCopySuccess = (success = true, method = "") => {
    console.log(success ? "✅ Content copied to clipboard successfully!" : "❌ Failed to copy content");
    const button = document.querySelector(".copy-button");
    if (button) {
      const originalText = button.innerHTML;
      
      if (success) {
        button.innerHTML =
          '<svg style="width: 16px; height: 16px; margin-right: 8px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>Copy Successfully';
        button.style.backgroundColor = "#059669";
        console.log(`Copy method used: ${method}`);
      } else {
        button.innerHTML = "❌ Copy Failed";
        button.style.backgroundColor = "#dc2626";
      }
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.style.backgroundColor = "#10b981";
      }, UI_CONFIG.COPY_SUCCESS_DURATION);
    }
  };

  const showCopyError = () => {
    showCopySuccess(false);
  };

  return { copyToClipboard, showCopySuccess, showCopyError };
}; 