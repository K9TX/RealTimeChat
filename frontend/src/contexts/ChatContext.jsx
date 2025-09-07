import React, { createContext, useContext, useState, useEffect } from 'react';
import chatService from '../services/chat';
import websocketService from '../services/websocket';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChatContext must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);

  // Load chat rooms on mount
  useEffect(() => {
    if (user) {
      loadChatRooms();
    }
  }, [user]);

  // WebSocket event listeners
  useEffect(() => {
    if (!currentRoom) return;

    const token = localStorage.getItem('token');
    
    // Connect to WebSocket
    websocketService.connect(currentRoom.id, token)
      .then(() => {
        setWsConnected(true);
      })
      .catch((error) => {
        console.error('WebSocket connection failed:', error);
        setError('Failed to connect to real-time chat');
      });

    // Set up WebSocket listeners
    const unsubscribers = [
      websocketService.addEventListener('chat_message', handleNewMessage),
      websocketService.addEventListener('file_message', handleNewMessage),
      websocketService.addEventListener('user_status', handleUserStatus),
      websocketService.addEventListener('user_update', handleUserUpdate),
      websocketService.addEventListener('user_profile_update', handleUserUpdate),
      websocketService.addEventListener('typing_indicator', handleTypingIndicator),
      websocketService.addEventListener('error', handleWebSocketError)
    ];

    return () => {
      // Clean up listeners
      unsubscribers.forEach(unsubscribe => unsubscribe());
      websocketService.disconnect();
      setWsConnected(false);
    };
  }, [currentRoom]);

  const loadChatRooms = async () => {
    try {
      setLoading(true);
      const rooms = await chatService.getChatRooms();
      setChatRooms(rooms);
    } catch (error) {
      setError('Failed to load chat rooms');
      console.error('Error loading chat rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (roomId, page = 1) => {
    try {
      setLoading(page === 1);
      const response = await chatService.getMessages(roomId, page);
      
      if (page === 1) {
        setMessages(response.results || response);
      } else {
        setMessages(prev => [...prev, ...(response.results || response)]);
      }
      
      return response;
    } catch (error) {
      setError('Failed to load messages');
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectRoom = async (room) => {
    setCurrentRoom(room);
    setMessages([]);
    setTypingUsers(new Set());
    
    // Load messages for the room
    await loadMessages(room.id);
    
    // Mark messages as read
    try {
      await chatService.markMessagesAsRead(room.id);
      // Update room's unread count in the list
      setChatRooms(prev => prev.map(r => 
        r.id === room.id ? { ...r, unread_count: 0 } : r
      ));
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async (content) => {
    if (!currentRoom || !content.trim()) return;

    if (websocketService.isConnected()) {
      websocketService.sendMessage(content.trim());
    } else {
      // Fallback to HTTP API
      try {
        const message = await chatService.sendMessage(currentRoom.id, {
          content: content.trim(),
          message_type: 'text'
        });
        setMessages(prev => [message, ...prev]);
      } catch (error) {
        setError('Failed to send message');
        console.error('Error sending message:', error);
      }
    }
  };

  const sendFile = async (file) => {
    if (!currentRoom || !file) return;

    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size cannot exceed 10MB');
      return;
    }

    try {
      if (websocketService.isConnected()) {
        // Send via WebSocket for real-time delivery
        const base64Data = await chatService.fileToBase64(file);
        websocketService.sendFileMessage(base64Data, file.name, file.type);
      } else {
        // Fallback to HTTP upload
        const message = await chatService.uploadFile(currentRoom.id, file);
        setMessages(prev => [message, ...prev]);
      }
    } catch (error) {
      setError('Failed to send file');
      console.error('Error sending file:', error);
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setSearchLoading(true);
      const result = await chatService.searchUsers(query);
      setSearchResults(result.users || []);
    } catch (error) {
      setError('Failed to search users');
      console.error('Error searching users:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const createPrivateChat = async (userId) => {
    try {
      const room = await chatService.createPrivateChat(userId);
      
      // Add to chat rooms if it's new
      setChatRooms(prev => {
        const exists = prev.find(r => r.id === room.id);
        return exists ? prev : [room, ...prev];
      });
      
      return room;
    } catch (error) {
      setError('Failed to create chat');
      console.error('Error creating private chat:', error);
      throw error;
    }
  };

  const sendTypingStart = () => {
    if (websocketService.isConnected()) {
      websocketService.sendTypingStart();
    }
  };

  const sendTypingStop = () => {
    if (websocketService.isConnected()) {
      websocketService.sendTypingStop();
    }
  };

  // Function to update user data across all components
  const updateUserInChatData = (updatedUser) => {
    // Update messages to reflect new username
    setMessages(prev => prev.map(message => {
      if (message.sender.id === updatedUser.id) {
        return {
          ...message,
          sender: {
            ...message.sender,
            username: updatedUser.username,
            first_name: updatedUser.first_name,
            last_name: updatedUser.last_name
          }
        };
      }
      return message;
    }));

    // Update chat rooms to reflect new participant names
    setChatRooms(prev => prev.map(room => ({
      ...room,
      participants: room.participants?.map(participant => 
        participant.id === updatedUser.id 
          ? { ...participant, ...updatedUser }
          : participant
      )
    })));

    // Update current room if it exists
    setCurrentRoom(prev => prev ? {
      ...prev,
      participants: prev.participants?.map(participant => 
        participant.id === updatedUser.id 
          ? { ...participant, ...updatedUser }
          : participant
      )
    } : prev);
  };

  // WebSocket event handlers
  const handleNewMessage = (data) => {
    const newMessage = {
      id: data.message_id,
      content: data.message,
      sender: {
        id: data.sender_id,
        username: data.sender
      },
      message_type: data.message_type,
      timestamp: data.timestamp,
      attachments: data.file_url ? [{
        file: data.file_url,
        file_name: data.file_name,
        file_size: data.file_size,
        file_type: data.file_type
      }] : []
    };

    setMessages(prev => [newMessage, ...prev]);
    
    // Update room's last message and timestamp
    setChatRooms(prev => prev.map(room => {
      if (room.id === currentRoom?.id) {
        return {
          ...room,
          last_message: newMessage,
          updated_at: data.timestamp
        };
      }
      return room;
    }));
  };

  const handleUserUpdate = (data) => {
    updateUserInChatData(data.user);
    
    // Add system message if provided
    if (data.system_message) {
      const systemMessage = {
        id: data.system_message.id,
        content: data.system_message.content,
        sender: {
          id: data.user.id,
          username: data.user.username
        },
        message_type: 'system',
        timestamp: data.system_message.timestamp,
        attachments: []
      };
      
      setMessages(prev => [systemMessage, ...prev]);
    }
  };

  const handleUserStatus = (data) => {
    setOnlineUsers(prev => {
      const newSet = new Set(prev);
      if (data.status === 'online') {
        newSet.add(data.user_id);
      } else {
        newSet.delete(data.user_id);
      }
      return newSet;
    });
  };

  const handleTypingIndicator = (data) => {
    setTypingUsers(prev => {
      const newSet = new Set(prev);
      if (data.is_typing) {
        newSet.add(data.username);
      } else {
        newSet.delete(data.username);
      }
      return newSet;
    });

    // Auto-remove typing indicator after 3 seconds
    if (data.is_typing) {
      setTimeout(() => {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          newSet.delete(data.username);
          return newSet;
        });
      }, 3000);
    }
  };

  const handleWebSocketError = (data) => {
    setError(data.message);
    setTimeout(() => setError(null), 5000);
  };

  const clearError = () => setError(null);

  // Function to refresh user data in chat when profile is updated
  const refreshUserData = (updatedUser) => {
    if (updatedUser) {
      updateUserInChatData(updatedUser);
      // Also reload chat rooms to get fresh participant data
      loadChatRooms();
    }
  };

  const value = {
    // State
    chatRooms,
    currentRoom,
    messages,
    onlineUsers,
    typingUsers,
    loading,
    error,
    searchResults,
    searchLoading,
    wsConnected,
    
    // Actions
    loadChatRooms,
    loadMessages,
    selectRoom,
    sendMessage,
    sendFile,
    searchUsers,
    createPrivateChat,
    sendTypingStart,
    sendTypingStop,
    refreshUserData,
    clearError
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
