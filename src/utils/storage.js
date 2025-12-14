// Storage utilities for conversation persistence

const STORAGE_KEYS = {
  CONVERSATIONS: 'gabay_conversations',
  ACTIVE_CONVERSATION: 'gabay_active_conversation',
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Get all conversations
export const getConversations = () => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading conversations:', error);
    return [];
  }
};

// Save all conversations
export const saveConversations = (conversations) => {
  try {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
    return true;
  } catch (error) {
    console.error('Error saving conversations:', error);
    return false;
  }
};

// Get active conversation ID
export const getActiveConversationId = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
  } catch (error) {
    return null;
  }
};

// Set active conversation ID
export const setActiveConversationId = (id) => {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVERSATION, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONVERSATION);
    }
  } catch (error) {
    console.error('Error setting active conversation:', error);
  }
};

// Create new conversation
export const createConversation = (title = 'New Chat', systemPrompt = null) => {
  const conversations = getConversations();
  const newConversation = {
    id: generateId(),
    title,
    messages: [
      {
        id: 1,
        text: 'Hi! How can I help you today?',
        sender: 'bot',
        timestamp: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    pinned: false,
    systemPrompt: systemPrompt, // Custom AI personality for this conversation
  };

  conversations.unshift(newConversation);
  saveConversations(conversations);
  setActiveConversationId(newConversation.id);

  return newConversation;
};

// Toggle pin status
export const togglePinConversation = (id) => {
  const conversations = getConversations();
  const index = conversations.findIndex(c => c.id === id);

  if (index !== -1) {
    conversations[index].pinned = !conversations[index].pinned;
    // Update updatedAt so local changes are recognized as newer during cloud sync
    conversations[index].updatedAt = new Date().toISOString();
    saveConversations(conversations);
    return conversations[index];
  }
  return null;
};

// Get conversations sorted (pinned first, then by date)
export const getSortedConversations = () => {
  const conversations = getConversations();
  // Create a new array to avoid mutating the original
  return [...conversations].sort((a, b) => {
    // Pinned items first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    // Then by date
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });
};

// Update conversation
export const updateConversation = (id, updates) => {
  const conversations = getConversations();
  const index = conversations.findIndex(c => c.id === id);

  if (index !== -1) {
    conversations[index] = {
      ...conversations[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveConversations(conversations);
    return conversations[index];
  }

  return null;
};

// Delete conversation
export const deleteConversation = (id) => {
  const conversations = getConversations();
  const filtered = conversations.filter(c => c.id !== id);
  saveConversations(filtered);

  // If deleting active conversation, switch to first available
  if (getActiveConversationId() === id) {
    if (filtered.length > 0) {
      setActiveConversationId(filtered[0].id);
    } else {
      setActiveConversationId(null);
    }
  }

  return filtered;
};

// Get conversation by ID
export const getConversationById = (id) => {
  const conversations = getConversations();
  return conversations.find(c => c.id === id) || null;
};

// Update conversation messages
export const updateConversationMessages = (id, messages) => {
  return updateConversation(id, { messages });
};

// Generate conversation title from first user message
export const generateTitle = (messages) => {
  const firstUserMessage = messages.find(m => m.sender === 'user');
  if (firstUserMessage) {
    const text = firstUserMessage.text;
    return text.length > 30 ? text.substring(0, 30) + '...' : text;
  }
  return 'New Chat';
};

// Export conversation as JSON
export const exportConversation = (conversation) => {
  const data = JSON.stringify(conversation, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${conversation.title || 'conversation'}-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

// Export conversation as text
export const exportConversationAsText = (conversation) => {
  let text = `# ${conversation.title}\n`;
  text += `Date: ${new Date(conversation.createdAt).toLocaleString()}\n\n`;
  text += '---\n\n';

  conversation.messages.forEach(msg => {
    const sender = msg.sender === 'user' ? 'You' : 'Gabay';
    const time = new Date(msg.timestamp).toLocaleTimeString();
    text += `[${time}] ${sender}:\n${msg.text}\n\n`;
  });

  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${conversation.title || 'conversation'}-${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  URL.revokeObjectURL(url);
};

// Search conversations
export const searchConversations = (query) => {
  if (!query.trim()) return getConversations();

  const conversations = getConversations();
  const lowerQuery = query.toLowerCase();

  return conversations.filter(conv => {
    // Search in title
    if (conv.title.toLowerCase().includes(lowerQuery)) return true;

    // Search in messages
    return conv.messages.some(msg =>
      msg.text.toLowerCase().includes(lowerQuery)
    );
  });
};

// Clean up duplicate empty "New Chat" conversations
// Keep only the most recent one if there are multiple empty chats
export const cleanupDuplicateChats = () => {
  const conversations = getConversations();

  // Find empty "New Chat" conversations (only have the initial bot message)
  const emptyChats = conversations.filter(c =>
    c.title === 'New Chat' &&
    c.messages.length <= 1
  );

  // If more than one empty chat, keep only the most recent
  if (emptyChats.length > 1) {
    const sortedEmpty = emptyChats.sort((a, b) =>
      new Date(b.updatedAt) - new Date(a.updatedAt)
    );

    // IDs to remove (all but the most recent)
    const idsToRemove = new Set(sortedEmpty.slice(1).map(c => c.id));

    const cleaned = conversations.filter(c => !idsToRemove.has(c.id));
    saveConversations(cleaned);
    console.log(`Cleaned up ${idsToRemove.size} duplicate empty chats`);
    return cleaned;
  }

  return conversations;
};
