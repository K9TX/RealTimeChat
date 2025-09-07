import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  Box,
  Typography,
  TextField,
  IconButton,
  Paper,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  InsertEmoticon as EmojiIcon,
  Phone as PhoneIcon,
  Videocam as VideocamIcon,
  MoreVert as MoreVertIcon,
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useChatContext } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";
import MessageList from "./MessageList";
import FileUpload from "./FileUpload";

const ChatWindow = ({ onMobileBack, onSearchClick }) => {
  const { user } = useAuth();
  const {
    currentRoom,
    messages,
    typingUsers,
    sendMessage,
    sendFile,
    sendTypingStart,
    sendTypingStop,
    wsConnected,
    loading,
  } = useChatContext();

  const [messageText, setMessageText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const messageInputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (currentRoom && messageInputRef.current) {
      messageInputRef.current.focus();
    }
  }, [currentRoom]);

  const roomDisplayName = useMemo(() => {
    if (!currentRoom) return "";

    if (currentRoom.name) {
      return currentRoom.name;
    }

    if (currentRoom.room_type === "private") {
      const otherParticipant = currentRoom.participants?.find(
        (p) => p.id !== user?.id
      );
      return otherParticipant
        ? otherParticipant.username || "Unknown User"
        : "Unknown User";
    }

    return `Room ${currentRoom.id}`;
  }, [
    currentRoom?.id,
    currentRoom?.name,
    currentRoom?.room_type,
    currentRoom?.participants
      ?.map((p) => `${p.id}-${p.username}-${p.first_name}-${p.last_name}`)
      .join(","),
    user?.id,
  ]);

  // Handle typing indicators
  useEffect(() => {
    if (messageText.trim() && !isTyping) {
      setIsTyping(true);
      sendTypingStart();
    } else if (!messageText.trim() && isTyping) {
      setIsTyping(false);
      sendTypingStop();
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    if (messageText.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        if (isTyping) {
          setIsTyping(false);
          sendTypingStop();
        }
      }, 2000);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [messageText, isTyping, sendTypingStart, sendTypingStop]);

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageText.trim()) return;

    const text = messageText.trim();
    setMessageText("");

    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      sendTypingStop();
    }

    await sendMessage(text);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const handleFileSelect = async (file) => {
    setShowFileUpload(false);
    await sendFile(file);
  };

  const getOnlineStatus = () => {
    if (!currentRoom || currentRoom.room_type !== "private") return null;

    const otherParticipant = currentRoom.participants?.find(
      (p) => p.id !== user?.id
    );

    return otherParticipant ? "Online" : null;
  };

  const getProfileImageUrl = (participant) => {
    if (!participant?.profile_image) return null;
    
    // Handle both full URLs and relative paths
    if (participant.profile_image.startsWith('http')) {
      return participant.profile_image;
    }
    return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${participant.profile_image}`;
  };

  if (!currentRoom) {
    return (
      <Box
        sx={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          Select a conversation to start chatting
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "transparent",
      }}
    >
      <Box
        className="mobile-chat-header"
        sx={{
          p: 1.5,
          background: "rgba(30, 30, 46, 0.9)",
          backdropFilter: "blur(15px)",
          borderBottom: "1px solid rgba(0, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <IconButton
          onClick={onMobileBack}
          sx={{
            display: { xs: "flex", md: "none" },
            color: "var(--primary-neon)",
            "&:hover": {
              transform: "scale(1.1)",
              color: "var(--text-neon)",
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        {currentRoom.room_type === "private" && (
          <Avatar
            src={(() => {
              const otherParticipant = currentRoom.participants?.find(
                (p) => p.id !== user?.id
              );
              return getProfileImageUrl(otherParticipant);
            })()}
            className="cyber-avatar"
            sx={{
              width: { xs: 36, md: 40 },
              height: { xs: 36, md: 40 },
              background: (() => {
                const otherParticipant = currentRoom.participants?.find(
                  (p) => p.id !== user?.id
                );
                return getProfileImageUrl(otherParticipant) 
                  ? 'transparent' 
                  : "linear-gradient(45deg, var(--primary-neon), var(--secondary-neon))";
              })(),
              border: "2px solid var(--primary-neon)",
              color: "var(--bg-primary)",
              fontFamily: "var(--font-secondary)",
              fontWeight: "bold",
            }}
          >
            {(() => {
              const otherParticipant = currentRoom.participants?.find(
                (p) => p.id !== user?.id
              );
              return !getProfileImageUrl(otherParticipant) ? roomDisplayName.charAt(0).toUpperCase() : null;
            })()}
          </Avatar>
        )}

        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="subtitle1"
            noWrap
            sx={{
              color: "var(--text-neon)",
              fontFamily: "var(--font-secondary)",
              fontWeight: "bold",
            }}
          >
            {roomDisplayName}
          </Typography>

          {getOnlineStatus() && (
            <Typography
              variant="caption"
              sx={{
                color: "var(--success-neon)",
                fontFamily: "var(--font-primary)",
              }}
            >
              {getOnlineStatus()}
            </Typography>
          )}

          {/* Typing indicators */}
          {typingUsers.size > 0 && (
            <Typography
              variant="caption"
              sx={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-primary)",
                fontStyle: "italic",
              }}
            >
              {Array.from(typingUsers).join(", ")}
              {typingUsers.size === 1 ? "is" : "are"} typing
            </Typography>
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <IconButton
            onClick={onSearchClick}
            sx={{
              display: { xs: "flex", md: "none" },
              color: "var(--text-neon)",
              "&:hover": {
                transform: "scale(1.1)",
                color: "var(--primary-neon)",
              },
            }}
          >
            <SearchIcon />
          </IconButton>
          <IconButton sx={{ color: "var(--text-neon)" }}>
            <a href="https://k9txshare.vercel.app/" target="_blank">
              <PhoneIcon />
            </a>
          </IconButton>
          <IconButton sx={{ color: "var(--text-neon)" }}>
            <VideocamIcon />
          </IconButton>
          <IconButton sx={{ color: "var(--text-neon)" }}>
            <MoreVertIcon />
          </IconButton>
        </Box>
      </Box>

      <Box
        className="chat-messages-container"
        sx={{
          flexGrow: 1,
          overflow: "hidden",
          background: "rgba(15, 15, 26, 0.9)",
          backdropFilter: "blur(20px)",
        }}
      >
        {loading ? (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <div className="cyber-loader" />
            <Typography
              variant="body2"
              className="glow-text"
              sx={{
                fontFamily: "var(--font-secondary)",
                textTransform: "uppercase",
              }}
            >
              Loading Messages...
            </Typography>
          </Box>
        ) : (
          <MessageList messages={messages} currentUser={user} />
        )}
      </Box>

      <Box
        sx={{
          p: 1,
          background: "rgba(30, 30, 46, 0.9)",
          backdropFilter: "blur(15px)",
          borderTop: "1px solid rgba(0, 255, 255, 0.2)",
        }}
      >
        <Box
          component="form"
          onSubmit={handleSendMessage}
          className="message-input-area"
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Box
            className="message-action-buttons"
            sx={{ display: "flex", gap: 0.5 }}
          >
            <IconButton
              onClick={() => setShowFileUpload(true)}
              sx={{
                color: "var(--text-neon)",
              }}
            >
              <AttachFileIcon />
            </IconButton>
          </Box>

          <TextField
            ref={messageInputRef}
            fullWidth
            multiline
            maxRows={4}
            placeholder="Type a message"
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyPress={handleKeyPress}
            variant="outlined"
            className="message-input-field"
            sx={{
              "& .MuiOutlinedInput-root": {
                background: "rgba(30, 30, 46, 0.95)",
                border: "1px solid rgba(0, 255, 255, 0.3)",
                borderRadius: "24px",
                color: "var(--text-primary)",
                fontFamily: "var(--font-primary)",
                backdropFilter: "blur(10px)",
                transition: "all 0.3s ease",
                minHeight: { xs: "40px", md: "48px" },
                "& fieldset": {
                  border: "none",
                },
                "&:hover": {
                  borderColor: "var(--primary-neon)",
                  boxShadow: "0 0 10px rgba(0, 255, 255, 0.2)",
                },
                "&.Mui-focused": {
                  borderColor: "var(--primary-neon)",
                  boxShadow: "0 0 15px rgba(0, 255, 255, 0.3)",
                },
              },
              "& .MuiOutlinedInput-input": {
                color: "#ffffff",
                fontSize: "1rem",
                lineHeight: "1.5",
                py: { xs: 1, md: 1.5 },
                px: 2,
                "&::placeholder": {
                  color: "rgba(255, 255, 255, 0.6)",
                  opacity: 1,
                },
              },
            }}
          />

          <IconButton
            type="submit"
            disabled={!messageText.trim() || !wsConnected}
            sx={{
              background: messageText.trim()
                ? "linear-gradient(45deg, var(--primary-neon), var(--secondary-neon))"
                : "rgba(128, 128, 128, 0.2)",
              color: messageText.trim()
                ? "var(--bg-primary)"
                : "var(--text-muted)",
              minWidth: { xs: "40px", md: "48px" },
              minHeight: { xs: "40px", md: "48px" },
              borderRadius: "50%",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: messageText.trim() ? "var(--glow-primary)" : "none",
                transform: messageText.trim() ? "scale(1.05)" : "none",
              },
              "&:disabled": {
                opacity: 0.5,
              },
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>

      <FileUpload
        open={showFileUpload}
        onClose={() => setShowFileUpload(false)}
        onFileSelect={handleFileSelect}
      />
    </Box>
  );
};

export default ChatWindow;
