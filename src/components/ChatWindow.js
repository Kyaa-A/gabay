import React, { useState, useEffect } from "react";
import Header from "./Chat/Header";
import MessageList from "./Chat/MessageList";
import InputArea from "./Chat/InputArea";
import Modal from "./Chat/Modal";
import ScrollToBottomButton from "./UI/ScrollToBottomButton";
import { useScrollManagement } from "../hooks/useScrollManagement";
import { INITIAL_MESSAGES } from "../constants/initialMessages";

const ChatWindow = () => {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const {
    autoScroll,
    setAutoScroll,
    messagesEndRef,
    messagesContainerRef,
    scrollToBottom,
    handleScroll,
  } = useScrollManagement(messages);

  // Keyboard shortcut: Escape to minimize
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isModalOpen) {
        window.electronAPI?.minimizeWindow();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen]);

  // Handle input change
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  // Handle sending messages
  const handleSendMessage = async () => {
    const hasText = inputValue.trim() !== "";
    const hasAttachments = attachments.length > 0;

    // Need either text or attachments to send
    if (!hasText && !hasAttachments) return;

    const userMessage = inputValue.trim();

    // Create user message with attachments
    const newMessage = {
      id: Date.now(),
      text: userMessage || (hasAttachments ? "Sent file(s) for analysis" : ""),
      sender: "user",
      timestamp: new Date(),
      attachments: attachments.map((a) => ({
        id: a.id,
        name: a.name,
        type: a.type,
        preview: a.preview,
      })),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Store attachments for API call before clearing
    const attachmentsToSend = [...attachments];
    setAttachments([]);
    setIsTyping(true);

    try {
      let aiResponse;

      // Use multimodal API if there are attachments
      if (attachmentsToSend.length > 0) {
        aiResponse = await window.electronAPI.sendMessageWithAttachments(
          userMessage,
          attachmentsToSend.map((a) => ({
            name: a.name,
            type: a.type,
            data: a.data,
          }))
        );
      } else {
        // Regular text-only message
        aiResponse = await window.electronAPI.sendMessage(userMessage);
      }

      const botResponse = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error("Error getting AI response:", error);

      const errorResponse = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble connecting to my AI services right now. Please try again in a moment.",
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  // Handle key press for sending messages
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle opening modal with full content
  const openModal = (content, title = "Full Content") => {
    setModalContent({ content, title });
    setIsModalOpen(true);
  };

  // Handle closing modal
  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  // Handle clearing chat history
  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
    setAutoScroll(true);
  };

  // Handle scroll to bottom button click
  const handleScrollToBottom = () => {
    console.log("Scroll to bottom button clicked");
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
      console.log("Scrolled to:", container.scrollTop, "Max:", container.scrollHeight);
      setAutoScroll(true);
    }
  };

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0f172a",
        color: "white",
        borderRadius: "20px",
        overflow: "hidden",
        boxSizing: "border-box",
        clipPath: "inset(0 round 20px)",
        boxShadow: "0 0 0 1px #374151",
      }}
      className="animate-slide-up"
    >
      <Header onClearChat={handleClearChat} />
      
      <MessageList
        messages={messages}
        isTyping={isTyping}
        onOpenModal={openModal}
        messagesContainerRef={messagesContainerRef}
        messagesEndRef={messagesEndRef}
        onScroll={handleScroll}
      />

      <ScrollToBottomButton 
        isVisible={!autoScroll} 
        onClick={handleScrollToBottom} 
      />

      <InputArea
        inputValue={inputValue}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        onSend={handleSendMessage}
        isDisabled={inputValue.trim() === ""}
        attachments={attachments}
        onAttachmentsChange={setAttachments}
      />

      <Modal
        isOpen={isModalOpen}
        content={modalContent}
        onClose={closeModal}
      />
    </div>
  );
};

export default ChatWindow;
