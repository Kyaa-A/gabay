import React, { useState, useEffect, useCallback, useRef } from "react";
import Header from "./Chat/Header";
import MessageList from "./Chat/MessageList";
import InputArea from "./Chat/InputArea";
import Modal from "./Chat/Modal";
import Sidebar from "./Chat/Sidebar";
import ScrollToBottomButton from "./UI/ScrollToBottomButton";
import AuthModal from "./Auth/AuthModal";
import SettingsModal from "./Settings/SettingsModal";
import KeyboardShortcutsModal from "./Settings/KeyboardShortcutsModal";
import SystemPromptModal from "./Settings/SystemPromptModal";
import { useScrollManagement } from "../hooks/useScrollManagement";
import { useAuth } from "../context/AuthContext";
import { INITIAL_MESSAGES } from "../constants/initialMessages";
import {
  getConversations,
  saveConversations,
  getActiveConversationId,
  setActiveConversationId,
  createConversation,
  updateConversation,
  deleteConversation,
  getConversationById,
  generateTitle,
  exportConversationAsText,
  generateId,
  togglePinConversation,
  cleanupDuplicateChats,
} from "../utils/storage";

const ChatWindow = () => {
  // Auth
  const { isAuthenticated, syncToCloud, deleteFromCloud, syncFromCloud, user, loading: authLoading } = useAuth();

  // Conversation state
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConvId] = useState(null);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);

  // UI state
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [regeneratingId, setRegeneratingId] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [shortcutsModalOpen, setShortcutsModalOpen] = useState(false);
  const [personalityModalOpen, setPersonalityModalOpen] = useState(false);

  const inputRef = useRef(null);
  const syncTimeoutRef = useRef(null);
  const sidebarToggleRef = useRef(null);

  const {
    autoScroll,
    setAutoScroll,
    messagesEndRef,
    messagesContainerRef,
    scrollToBottom,
    handleScroll,
  } = useScrollManagement(messages);

  // Load conversations - LOCAL FIRST approach for better UX
  // Using empty dependency array to ensure this only runs ONCE on mount
  useEffect(() => {
    // Helper to load and set conversations from array
    const setConversationsFromArray = (convs) => {
      if (convs.length > 0) {
        const sorted = [...convs].sort((a, b) =>
          new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        setConversations(sorted);
        setActiveConvId(sorted[0].id);
        setActiveConversationId(sorted[0].id);
        setMessages(sorted[0].messages.map(m => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })));
        console.log('Loaded conversation:', sorted[0].title, 'with', sorted[0].messages?.length || 0, 'messages');
        return true;
      }
      return false;
    };

    // Helper to create new conversation ONLY if none exist
    const createNewIfNeeded = () => {
      // Double-check localStorage to prevent duplicates
      const existingConvs = getConversations();
      if (existingConvs.length > 0) {
        console.log('Conversations already exist, not creating new one');
        return existingConvs[0];
      }
      console.log('Creating new conversation');
      const newConv = createConversation("New Chat");
      return newConv;
    };

    const loadConversations = () => {
      console.log('loadConversations called (initial mount)');

      // Clean up any duplicate empty chats first
      cleanupDuplicateChats();

      // Load from local storage
      const localConvs = getConversations();
      console.log('Local conversations found:', localConvs.length);

      if (localConvs.length > 0) {
        setConversationsFromArray(localConvs);
      } else {
        const newConv = createNewIfNeeded();
        setConversations([newConv]);
        setActiveConvId(newConv.id);
        setMessages(newConv.messages.map(m => ({
          ...m,
          timestamp: new Date(m.timestamp)
        })));
      }
    };

    loadConversations();
  // eslint-disable-next-line
  }, []); // Empty dependency array - only run on mount

  // Cloud sync effect - separate from initial load
  // Using a ref to ensure this only runs once per auth session
  const hasSyncedRef = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || !user?.id || authLoading) {
      hasSyncedRef.current = false; // Reset when logged out
      return;
    }

    // Only sync once per session
    if (hasSyncedRef.current) {
      return;
    }
    hasSyncedRef.current = true;

    console.log('User authenticated, syncing from cloud in background...');

    syncFromCloud(user.id).then(cloudConvs => {
      console.log('Background sync returned:', cloudConvs?.length || 0, 'conversations');

      if (cloudConvs && cloudConvs.length > 0) {
        const currentLocal = getConversations();
        const localIds = new Set(currentLocal.map(c => c.id));
        const hasNewFromCloud = cloudConvs.some(c => !localIds.has(c.id));

        if (hasNewFromCloud || cloudConvs.length > currentLocal.length) {
          console.log('Cloud has new/more conversations, updating UI');
          const sorted = [...cloudConvs].sort((a, b) =>
            new Date(b.updatedAt) - new Date(a.updatedAt)
          );
          setConversations(sorted);
        }
      }
    }).catch(err => {
      console.error('Background cloud sync failed:', err);
    });
  // eslint-disable-next-line
  }, [isAuthenticated, user?.id, authLoading]);

  // Save messages to storage when they change
  useEffect(() => {
    if (activeConversationId && messages.length > 0) {
      // Check if conversation exists before updating
      const existingConv = getConversationById(activeConversationId);
      if (!existingConv) {
        console.warn('Active conversation not found in storage:', activeConversationId);
        return;
      }

      const serializedMessages = messages.map(m => ({
        ...m,
        timestamp: m.timestamp instanceof Date ? m.timestamp.toISOString() : m.timestamp
      }));

      const title = generateTitle(messages);
      const updated = updateConversation(activeConversationId, {
        messages: serializedMessages,
        title
      });

      if (updated) {
        setConversations(getConversations());
      }

      // Debounced cloud sync - sync after 2 seconds of inactivity
      if (isAuthenticated) {
        if (syncTimeoutRef.current) {
          clearTimeout(syncTimeoutRef.current);
        }
        syncTimeoutRef.current = setTimeout(() => {
          syncToCloud();
        }, 2000);
      }
    }
  }, [messages, activeConversationId, isAuthenticated, syncToCloud]);

  // Cleanup sync timeout
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ? key for keyboard shortcuts help
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShortcutsModalOpen(true);
        return;
      }

      if (e.key === "Escape") {
        if (shortcutsModalOpen) {
          setShortcutsModalOpen(false);
        } else if (settingsModalOpen) {
          setSettingsModalOpen(false);
        } else if (authModalOpen) {
          setAuthModalOpen(false);
        } else if (isModalOpen) {
          closeModal();
        } else if (sidebarOpen) {
          setSidebarOpen(false);
        } else {
          window.electronAPI?.minimizeWindow();
        }
        return;
      }

      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case "n":
            e.preventDefault();
            handleNewConversation();
            break;
          case "f":
            e.preventDefault();
            setSidebarOpen(true);
            break;
          case "e":
            e.preventDefault();
            handleExport();
            break;
          case "b":
            e.preventDefault();
            setSidebarOpen(prev => !prev);
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, sidebarOpen, activeConversationId, messages, authModalOpen, settingsModalOpen, shortcutsModalOpen]);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleSendMessage = async () => {
    const hasText = inputValue.trim() !== "";
    const hasAttachments = attachments.length > 0;

    if (!hasText && !hasAttachments) return;

    const userMessage = inputValue.trim();

    const newMessage = {
      id: generateId(),
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

    const attachmentsToSend = [...attachments];
    setAttachments([]);
    setIsTyping(true);

    try {
      let aiResponse;
      const systemPrompt = getCurrentSystemPrompt();

      if (attachmentsToSend.length > 0) {
        aiResponse = await window.electronAPI.sendMessageWithAttachments(
          userMessage,
          attachmentsToSend.map((a) => ({
            name: a.name,
            type: a.type,
            data: a.data,
          })),
          systemPrompt
        );
      } else {
        aiResponse = await window.electronAPI.sendMessage(userMessage, systemPrompt);
      }

      const botResponse = {
        id: generateId(),
        text: aiResponse,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botResponse]);

      // Immediate sync after AI response
      if (isAuthenticated) {
        setTimeout(() => syncToCloud(), 500);
      }
    } catch (error) {
      console.error("Error getting AI response:", error);

      // Show the actual error message from the backend
      let errorText = "I'm sorry, I'm having trouble connecting to my AI services right now. Please try again in a moment.";

      if (error?.message) {
        if (error.message.includes("API key")) {
          errorText = "No API key configured. Please go to Settings (click the ⋮ menu) and add an API key for your chosen AI provider.";
        } else if (error.message.includes("quota") || error.message.includes("rate_limit")) {
          errorText = "API quota or rate limit exceeded. Please try again later or switch to a different AI provider in Settings.";
        } else if (error.message.includes("network") || error.message.includes("fetch") || error.message.includes("ENOTFOUND")) {
          errorText = "Network error - please check your internet connection and try again.";
        } else if (error.message.includes("Invalid") || error.message.includes("authentication")) {
          errorText = "Invalid API key. Please check your API key in Settings.";
        } else {
          errorText = `AI Error: ${error.message}`;
        }
      }

      const errorResponse = {
        id: generateId(),
        text: errorText,
        sender: "bot",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const openModal = (content, title = "Full Content") => {
    setModalContent({ content, title });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalContent(null);
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES.map(m => ({
      ...m,
      id: generateId(),
      timestamp: new Date()
    })));
    setAutoScroll(true);
  };

  const handleScrollToBottom = () => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      container.scrollTop = container.scrollHeight;
      setAutoScroll(true);
    }
  };

  const handleEditMessage = useCallback(async (messageId, newText) => {
    // Find the index of the edited message
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) return;

    const editedMessage = messages[messageIndex];

    // Only handle user messages - delete all after and get new AI response
    if (editedMessage.sender === "user") {
      // Keep messages up to and including the edited one (with new text)
      const updatedMessages = messages.slice(0, messageIndex + 1).map(msg =>
        msg.id === messageId
          ? { ...msg, text: newText, edited: true }
          : msg
      );

      setMessages(updatedMessages);
      setIsTyping(true);

      try {
        // Clear AI conversation history and rebuild
        await window.electronAPI?.clearConversationHistory?.();

        // Get AI response to the edited message
        let aiResponse;
        if (editedMessage.attachments?.length > 0) {
          aiResponse = await window.electronAPI.sendMessageWithAttachments(
            newText,
            editedMessage.attachments
          );
        } else {
          aiResponse = await window.electronAPI.sendMessage(newText);
        }

        const botMessage = {
          id: generateId(),
          text: aiResponse,
          sender: "bot",
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        console.error("Error getting AI response after edit:", error);
        const errorMessage = {
          id: generateId(),
          text: "Sorry, I encountered an error. Please try again.",
          sender: "bot",
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsTyping(false);
      }
    } else {
      // For bot messages, just update the text
      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, text: newText, edited: true }
          : msg
      ));
    }
  }, [messages]);

  const handleDeleteMessage = useCallback((messageId) => {
    setMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, []);

  const handleRegenerateMessage = useCallback(async (messageId) => {
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex < 1) return;

    const userMessage = messages[messageIndex - 1];
    if (userMessage.sender !== "user") return;

    setRegeneratingId(messageId);

    try {
      let aiResponse;

      if (userMessage.attachments?.length > 0) {
        aiResponse = await window.electronAPI.sendMessage(userMessage.text);
      } else {
        aiResponse = await window.electronAPI.sendMessage(userMessage.text);
      }

      setMessages(prev => prev.map(msg =>
        msg.id === messageId
          ? { ...msg, text: aiResponse, timestamp: new Date() }
          : msg
      ));
    } catch (error) {
      console.error("Error regenerating response:", error);
    } finally {
      setRegeneratingId(null);
    }
  }, [messages]);

  const handleNewConversation = () => {
    const newConv = createConversation("New Chat");
    setConversations(prev => [newConv, ...prev]);
    setActiveConvId(newConv.id);
    setActiveConversationId(newConv.id);
    setMessages(newConv.messages.map(m => ({
      ...m,
      timestamp: new Date(m.timestamp)
    })));
    setSidebarOpen(false);
  };

  const handleSelectConversation = async (id) => {
    const conv = getConversationById(id);
    if (conv) {
      try {
        await window.electronAPI?.clearConversationHistory?.();
      } catch (e) {
        console.log("Could not clear AI history:", e);
      }

      setActiveConvId(id);
      setActiveConversationId(id);
      setMessages(conv.messages.map(m => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })));
      setSidebarOpen(false);
    }
  };

  const handleDeleteConversation = (id) => {
    console.log('Deleting conversation:', id);
    const remaining = deleteConversation(id);
    console.log('Remaining conversations:', remaining.length);

    // Force a new array reference to trigger re-render
    setConversations([...remaining]);

    // Delete from cloud if authenticated
    if (isAuthenticated) {
      deleteFromCloud(id);
    }

    if (remaining.length === 0) {
      console.log('No conversations left, creating new one');
      const newConv = createConversation("New Chat");
      setConversations([newConv]);
      setActiveConvId(newConv.id);
      setActiveConversationId(newConv.id);
      setMessages(newConv.messages.map(m => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })));
    } else if (id === activeConversationId) {
      console.log('Deleted active conversation, switching to:', remaining[0].id);
      setActiveConvId(remaining[0].id);
      setActiveConversationId(remaining[0].id);
      setMessages(remaining[0].messages.map(m => ({
        ...m,
        timestamp: new Date(m.timestamp)
      })));
    }
  };

  const handleRenameConversation = (id, newTitle) => {
    // Update in localStorage (updateConversation already sets updatedAt)
    updateConversation(id, { title: newTitle });
    // Update local state with new updatedAt
    const now = new Date().toISOString();
    setConversations(prev => prev.map(conv =>
      conv.id === id ? { ...conv, title: newTitle, updatedAt: now } : conv
    ));
    // Sync to cloud immediately so changes aren't lost
    if (isAuthenticated) {
      setTimeout(() => syncToCloud(), 500);
    }
  };

  const handlePinConversation = (id) => {
    // Update in localStorage
    togglePinConversation(id);
    // Update local state with new updatedAt so it's recognized as newer than cloud
    const now = new Date().toISOString();
    setConversations(prev => prev.map(conv =>
      conv.id === id ? { ...conv, pinned: !conv.pinned, updatedAt: now } : conv
    ));
    // Sync to cloud immediately so changes aren't lost
    if (isAuthenticated) {
      setTimeout(() => syncToCloud(), 500);
    }
  };

  const handleExport = () => {
    const conv = getConversationById(activeConversationId);
    if (conv) {
      exportConversationAsText(conv);
    }
  };

  const handleSaveSystemPrompt = (prompt) => {
    if (activeConversationId) {
      updateConversation(activeConversationId, { systemPrompt: prompt });
      setConversations(getConversations());
    }
  };

  const getCurrentSystemPrompt = () => {
    const conv = getConversationById(activeConversationId);
    return conv?.systemPrompt || null;
  };

  // Sort conversations for display (pinned first, then by date)
  const sortedConversations = [...conversations].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  const filteredConversations = searchQuery.trim()
    ? sortedConversations.filter(conv =>
        conv.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.messages.some(msg => msg.text.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    : sortedConversations;

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0f172a",
        color: "white",
        overflow: "hidden",
        boxSizing: "border-box",
        position: "relative",
      }}
      className="animate-slide-up"
    >
      <Header
        onClearChat={handleClearChat}
        onToggleSidebar={() => setSidebarOpen(prev => !prev)}
        onExport={handleExport}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenSettings={() => setSettingsModalOpen(true)}
        onOpenPersonality={() => setPersonalityModalOpen(true)}
        sidebarToggleRef={sidebarToggleRef}
      />

      <MessageList
        messages={messages}
        isTyping={isTyping}
        onOpenModal={openModal}
        messagesContainerRef={messagesContainerRef}
        messagesEndRef={messagesEndRef}
        onScroll={handleScroll}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
        onRegenerateMessage={handleRegenerateMessage}
        regeneratingId={regeneratingId}
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

      <Sidebar
        conversations={filteredConversations}
        activeId={activeConversationId}
        onSelect={handleSelectConversation}
        onNewChat={handleNewConversation}
        onDelete={handleDeleteConversation}
        onRename={handleRenameConversation}
        onPin={handlePinConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        toggleButtonRef={sidebarToggleRef}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      <SettingsModal
        isOpen={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />

      <KeyboardShortcutsModal
        isOpen={shortcutsModalOpen}
        onClose={() => setShortcutsModalOpen(false)}
      />

      <SystemPromptModal
        isOpen={personalityModalOpen}
        onClose={() => setPersonalityModalOpen(false)}
        currentPrompt={getCurrentSystemPrompt()}
        onSave={handleSaveSystemPrompt}
      />
    </div>
  );
};

export default ChatWindow;
