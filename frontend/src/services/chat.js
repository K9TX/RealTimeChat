import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const chatService = {
  // Chat rooms
  getChatRooms: async () => {
    const response = await axios.get(`${API_URL}/chat/rooms/`);
    return response.data;
  },

  getChatRoom: async (roomId) => {
    const response = await axios.get(`${API_URL}/chat/rooms/${roomId}/`);
    return response.data;
  },

  createChatRoom: async (roomData) => {
    const response = await axios.post(`${API_URL}/chat/rooms/`, roomData);
    return response.data;
  },

  createPrivateChat: async (userId) => {
    const response = await axios.post(`${API_URL}/chat/rooms/private/`, {
      user_id: userId
    });
    return response.data;
  },

  // Messages
  getMessages: async (roomId, page = 1) => {
    const response = await axios.get(
      `${API_URL}/chat/rooms/${roomId}/messages/?page=${page}`
    );
    return response.data;
  },

  sendMessage: async (roomId, messageData) => {
    const response = await axios.post(
      `${API_URL}/chat/rooms/${roomId}/messages/`,
      messageData
    );
    return response.data;
  },

  markMessagesAsRead: async (roomId) => {
    const response = await axios.post(
      `${API_URL}/chat/rooms/${roomId}/messages/read/`
    );
    return response.data;
  },

  // File upload
  uploadFile: async (roomId, file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(
      `${API_URL}/chat/rooms/${roomId}/upload/`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress,
      }
    );
    return response.data;
  },

  // User search
  searchUsers: async (query) => {
    const response = await axios.get(
      `${API_URL}/chat/users/search/?q=${encodeURIComponent(query)}`
    );
    return response.data;
  },

  // Helper functions
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  isImageFile: (fileName) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const extension = fileName.split('.').pop()?.toLowerCase();
    return imageExtensions.includes(extension);
  },

  // Convert file to base64 for WebSocket transmission
  fileToBase64: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        // Remove the data URL prefix (data:type;base64,)
        const base64 = reader.result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
    });
  },
};

export default chatService;
