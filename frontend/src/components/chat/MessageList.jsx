import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Link,
  Chip,
  Fade,
  Zoom,
} from "@mui/material";
import {
  Download as DownloadIcon,
  Image as ImageIcon,
  InsertDriveFile as FileIcon,
} from "@mui/icons-material";
import chatService from "../../services/chat";

const MessageList = ({ messages, currentUser }) => {
  const messagesEndRef = useRef(null);
  const [visibleMessages, setVisibleMessages] = useState(new Set());

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    // Add animation delay for new messages
    const timer = setTimeout(() => {
      setVisibleMessages(new Set(messages.map((m) => m.id)));
    }, 100);
    return () => clearTimeout(timer);
  }, [messages]);

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "TODAY";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "YESTERDAY";
    } else {
      return date
        .toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
        .toUpperCase();
    }
  };

  const renderFileAttachment = (attachment) => {
    const isImage = chatService.isImageFile(attachment.file_name);

    return (
      <Box key={attachment.id} sx={{ mt: 1.5 }}>
        {isImage ? (
          <Box
            className="cyber-card"
            sx={{
              position: "relative",
              overflow: "hidden",
              borderRadius: "12px",
              background: "rgba(0, 255, 255, 0.05)",
              border: "1px solid rgba(0, 255, 255, 0.2)",
              cursor: "pointer",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "var(--primary-neon)",
                boxShadow: "var(--glow-soft)",
                transform: "scale(1.02)",
              },
              maxWidth: { xs: "200px", md: "280px" },
            }}
            onClick={() => window.open(attachment.file, "_blank")}
          >
            <img
              src={attachment.file}
              alt={attachment.file_name}
              style={{
                maxWidth: "100%",
                maxHeight: { xs: "120px", md: "180px" },
                borderRadius: "12px",
                display: "block",
              }}
            />
            <Box
              sx={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(transparent, rgba(0, 0, 0, 0.7))",
                p: 1,
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-primary)",
                  fontSize: { xs: "0.7rem", md: "0.8rem" },
                }}
              >
                {attachment.file_name}
              </Typography>
            </Box>
          </Box>
        ) : (
          <Link
            href={attachment.file}
            target="_blank"
            download={attachment.file_name}
            className="file-drop-zone"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              p: 2,
              background: "rgba(0, 255, 255, 0.05)",
              border: "1px solid rgba(0, 255, 255, 0.2)",
              borderRadius: "12px",
              textDecoration: "none",
              transition: "all 0.3s ease",
              "&:hover": {
                borderColor: "var(--primary-neon)",
                boxShadow: "var(--glow-soft)",
                background: "rgba(0, 255, 255, 0.1)",
              },
              maxWidth: { xs: "200px", md: "280px" },
            }}
          >
            <FileIcon
              sx={{
                color: "var(--primary-neon)",
                fontSize: { xs: "1.5rem", md: "2rem" },
              }}
            />
            <Box sx={{ flexGrow: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  color: "var(--text-primary)",
                  fontFamily: "var(--font-primary)",
                  fontWeight: "bold",
                  fontSize: { xs: "0.8rem", md: "0.9rem" },
                }}
              >
                {attachment.file_name}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "var(--text-secondary)",
                  fontFamily: "var(--font-primary)",
                  fontSize: { xs: "0.7rem", md: "0.8rem" },
                }}
              >
                {attachment.file_size_display ||
                  chatService.formatFileSize(attachment.file_size)}
              </Typography>
            </Box>
            <DownloadIcon
              sx={{
                color: "var(--primary-neon)",
                transition: "transform 0.3s ease",
                fontSize: { xs: "1.2rem", md: "1.5rem" },
              }}
            />
          </Link>
        )}
      </Box>
    );
  };

  return (
    <Box
      sx={{
        height: "100%",
        overflow: "auto",
        p: 1,
        display: "flex",
        flexDirection: "column-reverse",
        background: "transparent",
        backgroundImage:
          'url(\'data:image/svg+xml,%3Csvg width="100" height="100" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"%3E%3Cpath d="M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z" fill="%2300ffff" fill-opacity="0.05" fill-rule="evenodd"/%3E%3C/svg%3E\')',
      }}
    >
      <div ref={messagesEndRef} />
      {messages.map((message, index) => {
        const isOwn = message.sender.id === currentUser?.id;
        const isVisible = visibleMessages.has(message.id);
        const showDateSeparator =
          index === messages.length - 1 ||
          formatDate(message.timestamp) !==
            formatDate(messages[index + 1]?.timestamp);

        return (
          <Box key={message.id}>
            {/* Date Separator */}
            {showDateSeparator && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  my: 2,
                }}
              >
                <Chip
                  label={formatDate(message.timestamp)}
                  size="small"
                  sx={{
                    background:
                      "linear-gradient(45deg, var(--primary-neon), var(--secondary-neon))",
                    color: "var(--bg-primary)",
                    fontFamily: "var(--font-secondary)",
                    fontWeight: "bold",
                    fontSize: { xs: "0.6rem", md: "0.7rem" },
                    letterSpacing: "1px",
                    boxShadow: "var(--glow-soft)",
                    border: "none",
                    height: { xs: 20, md: 24 },
                  }}
                />
              </Box>
            )}

            {/* System Message for username changes */}
            {message.message_type === 'system' ? (
              <Fade in={isVisible} timeout={300}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    my: 2
                  }}
                >
                  <Chip
                    label={message.content}
                    size="small"
                    sx={{
                      background: 'linear-gradient(45deg, var(--warning-neon), var(--accent-neon))',
                      color: 'var(--bg-primary)',
                      fontFamily: 'var(--font-primary)',
                      fontSize: { xs: "0.7rem", md: "0.75rem" },
                      opacity: 0.8,
                      maxWidth: '80%',
                      height: 'auto',
                      '& .MuiChip-label': {
                        whiteSpace: 'normal',
                        padding: '4px 8px'
                      }
                    }}
                  />
                </Box>
              </Fade>
            ) : (
              /* Regular Message */
              <Fade in={isVisible} timeout={300}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: isOwn ? "flex-end" : "flex-start",
                    mb: 1,
                  }}
                >
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: isOwn ? "row-reverse" : "row",
                    alignItems: "flex-end",
                    gap: 1,
                    maxWidth: "100%",
                  }}
                >
                  {/* Avatar for other users */}
                  {!isOwn && (
                    <Zoom in={isVisible} timeout={200}>
                      <Avatar
                        sx={{
                          width: { xs: 24, md: 30 },
                          height: { xs: 24, md: 30 },
                          fontSize: { xs: "0.7rem", md: "0.8rem" },
                          background:
                            "linear-gradient(45deg, var(--secondary-neon), var(--accent-neon))",
                          border: "2px solid var(--secondary-neon)",
                          color: "var(--bg-primary)",
                          fontFamily: "var(--font-secondary)",
                          fontWeight: "bold",
                          mb: "auto",
                        }}
                      >
                        {message.sender.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </Zoom>
                  )}

                  {/* Message Bubble - WhatsApp-like styling */}
                  <Box
                    sx={{
                      position: "relative",
                      p: { xs: 1, md: 1.5 },
                      borderRadius: isOwn
                        ? "18px 4px 18px 18px"
                        : "4px 18px 18px 18px",
                      maxWidth: "100%",
                      wordWrap: "break-word",
                      background: isOwn
                        ? "linear-gradient(135deg, #00a884, #008c69)" // WhatsApp green for own messages
                        : "linear-gradient(135deg, #2a2f32, #3b4043)", // Dark gray for other messages
                      color: isOwn ? "#ffffff" : "#e9edef",
                      boxShadow: "0 1px 1px rgba(0, 0, 0, 0.1)",
                    }}
                  >

                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.5,
                        fontSize: { xs: "0.85rem", md: "0.95rem" },
                      }}
                    >
                      {message.content}
                    </Typography>

                    {/* File attachments */}
                    {message.attachments?.map(renderFileAttachment)}

                    {/* Message Info */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "center",
                        mt: 0.5,
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: isOwn
                            ? "rgba(255, 255, 255, 0.8)"
                            : "rgba(255, 255, 255, 0.6)",
                          fontSize: { xs: "0.6rem", md: "0.7rem" },
                        }}
                      >
                        {formatTime(message.timestamp)}
                      </Typography>

                      {isOwn && (
                        <Box
                          sx={{
                            width: { xs: 6, md: 8 },
                            height: { xs: 6, md: 8 },
                            borderRadius: "50%",
                            background: "#00a884", // WhatsApp green
                          }}
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Fade>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default MessageList;