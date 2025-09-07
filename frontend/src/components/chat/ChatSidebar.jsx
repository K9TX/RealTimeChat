import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Badge,
  IconButton,
  Divider,
  CircularProgress,
  TextField,
  Menu,
  MenuItem,
} from "@mui/material";
import {
  Search as SearchIcon,
  Circle as CircleIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  AccountCircle as AccountIcon,
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";
import { useChatContext } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";
import UserProfile from "../profile/UserProfile";
import { useNavigate } from "react-router-dom";

const ChatSidebar = ({ onSearchClick, onChatSelect, onMobileClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { chatRooms, currentRoom, selectRoom, onlineUsers, loading } =
    useChatContext();

  const [userMenuAnchor, setUserMenuAnchor] = useState(null);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);

  const handleUserMenuOpen = (event) => {
    setUserMenuAnchor(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserMenuAnchor(null);
  };

  const handleProfileClick = () => {
    setProfileDialogOpen(true);
    handleUserMenuClose();
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    handleUserMenuClose();
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = diffMs / (1000 * 60 * 60);
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return diffMins < 1 ? "now" : `${diffMins}m`;
    } else if (diffDays < 1) {
      return `${Math.floor(diffHours)}h`;
    } else if (diffDays < 7) {
      return `${Math.floor(diffDays)}d`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getRoomDisplayName = (room) => {
    if (room.name) {
      return room.name;
    }

    if (room.room_type === "private") {
      // For private chats, show the other participant's name
      const otherParticipant = room.participants?.find(
        (p) => p.id !== user?.id
      );
      return otherParticipant
        ? otherParticipant.first_name && otherParticipant.last_name
          ? `${otherParticipant.first_name} ${otherParticipant.last_name}`
          : otherParticipant.username
        : "Unknown User";
    }

    return `Room ${room.id}`;
  };

  const getRoomAvatar = (room) => {
    if (room.room_type === "private") {
      const otherParticipant = room.participants?.find(
        (p) => p.id !== user?.id
      );
      if (otherParticipant) {
        return (
          <Badge
            variant="dot"
            color={onlineUsers.has(otherParticipant.id) ? "success" : "default"}
            overlap="circular"
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Avatar
              className="cyber-avatar"
              sx={{
                bgcolor: "primary.main",
                width: { xs: 36, md: 40 },
                height: { xs: 36, md: 40 },
              }}
            >
              {otherParticipant.username.charAt(0).toUpperCase()}
            </Avatar>
          </Badge>
        );
      }
    }

    return (
      <Avatar
        className="cyber-avatar"
        sx={{
          bgcolor: "secondary.main",
          width: { xs: 36, md: 40 },
          height: { xs: 36, md: 40 },
        }}
      >
        {room.name ? room.name.charAt(0).toUpperCase() : "G"}
      </Avatar>
    );
  };

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "rgba(15, 15, 26, 0.9)",
      }}
    >
      {/* WhatsApp-like Header */}
      <Box
        sx={{
          p: 1.5,
          background: "rgba(30, 30, 46, 0.9)",
          backdropFilter: "blur(15px)",
          borderBottom: "1px solid rgba(0, 255, 255, 0.2)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.5,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton
              onClick={() => navigate("/dashboard")}
              sx={{
                color: "var(--text-neon)",
                "&:hover": {
                  transform: "scale(1.1)",
                  color: "var(--primary-neon)",
                },
              }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Typography
              variant="h6"
              sx={{
                color: "var(--text-neon)",
                fontFamily: "var(--font-secondary)",
                fontWeight: "bold",
                fontSize: { xs: "1.1rem", md: "1.25rem" },
              }}
            >
              Chats
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <IconButton
              onClick={onSearchClick}
              sx={{ color: "var(--text-neon)" }}
            >
              <SearchIcon />
            </IconButton>
            <IconButton sx={{ color: "var(--text-neon)" }}>
              <EditIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Search Bar */}
        <TextField
          fullWidth
          placeholder="Search or start new chat"
          variant="outlined"
          size="small"
          sx={{
            "& .MuiOutlinedInput-root": {
              background: "rgba(30, 30, 46, 0.95)",
              border: "1px solid rgba(0, 255, 255, 0.3)",
              borderRadius: "18px",
              color: "var(--text-primary)",
              fontFamily: "var(--font-primary)",
              backdropFilter: "blur(10px)",
              transition: "all 0.3s ease",
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
              fontSize: { xs: "0.85rem", md: "0.9rem" },
              py: { xs: 0.8, md: 1 },
              px: { xs: 1.2, md: 1.5 },
              "&::placeholder": {
                color: "rgba(255, 255, 255, 0.6)",
                opacity: 1,
              },
            },
          }}
        />
      </Box>

      {/* Chat Rooms List - WhatsApp-like styling */}
      <Box sx={{ flexGrow: 1, overflow: "auto" }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : chatRooms.length === 0 ? (
          <Box sx={{ textAlign: "center", p: 3 }}>
            <Typography variant="body2" color="text.secondary">
              No conversations yet
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Start a new chat by searching for users
            </Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {chatRooms.map((room) => (
              <React.Fragment key={room.id}>
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => {
                      selectRoom(room);
                      if (onChatSelect) onChatSelect(); // Hide sidebar on mobile when chat is selected
                    }}
                    selected={currentRoom?.id === room.id}
                    sx={{
                      px: { xs: 1, md: 1.5 },
                      py: { xs: 0.8, md: 1 },
                      "&.Mui-selected": {
                        background: "rgba(0, 255, 255, 0.1)",
                      },
                      "&:hover": {
                        background: "rgba(0, 255, 255, 0.05)",
                      },
                    }}
                  >
                    <ListItemAvatar>{getRoomAvatar(room)}</ListItemAvatar>
                    <ListItemText
                      primary={
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: room.unread_count > 0 ? 600 : 400,
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              maxWidth: "60%",
                              color:
                                room.unread_count > 0
                                  ? "var(--text-neon)"
                                  : "var(--text-primary)",
                              fontSize: { xs: "0.9rem", md: "1rem" },
                            }}
                          >
                            {getRoomDisplayName(room)}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            {room.last_message && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{
                                  fontSize: { xs: "0.65rem", md: "0.75rem" },
                                  color: "var(--text-secondary)",
                                }}
                              >
                                {formatTime(room.last_message.timestamp)}
                              </Typography>
                            )}
                            {room.unread_count > 0 && (
                              <Badge
                                badgeContent={
                                  room.unread_count > 99
                                    ? "99+"
                                    : room.unread_count
                                }
                                color="primary"
                                sx={{
                                  "& .MuiBadge-badge": {
                                    backgroundColor: "#00a884", // WhatsApp green
                                    color: "#ffffff",
                                    fontSize: { xs: "0.5rem", md: "0.6rem" },
                                    minWidth: { xs: 16, md: 18 },
                                    height: { xs: 16, md: 18 },
                                  },
                                }}
                              />
                            )}
                          </Box>
                        </Box>
                      }
                      secondary={
                        room.last_message ? (
                          <Typography
                            variant="body2"
                            sx={{
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                              fontWeight: room.unread_count > 0 ? 500 : 400,
                              fontSize: { xs: "0.8rem", md: "0.875rem" },
                              color: "var(--text-secondary)",
                            }}
                          >
                            {room.last_message.message_type === "file"
                              ? `📎 ${room.last_message.content}`
                              : room.last_message.content}
                          </Typography>
                        ) : (
                          <Typography
                            variant="body2"
                            sx={{
                              fontSize: { xs: "0.8rem", md: "0.875rem" },
                              color: "var(--text-secondary)",
                            }}
                          >
                            No messages yet
                          </Typography>
                        )
                      }
                    />
                  </ListItemButton>
                </ListItem>
                <Divider
                  variant="inset"
                  component="li"
                  sx={{ borderColor: "rgba(0, 255, 255, 0.1)" }}
                />
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>

      {/* User Profile Section */}
      <Box
        sx={{
          p: 2,
          borderTop: "1px solid rgba(0, 255, 255, 0.2)",
          background: "rgba(30, 30, 46, 0.9)",
          backdropFilter: "blur(15px)",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            cursor: "pointer",
            p: 1,
            borderRadius: "12px",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "rgba(0, 255, 255, 0.1)",
              border: "1px solid rgba(0, 255, 255, 0.2)",
              boxShadow: "var(--glow-soft)",
            },
          }}
          onClick={handleUserMenuOpen}
        >
          <Avatar
            className="cyber-avatar"
            sx={{
              width: { xs: 40, md: 48 },
              height: { xs: 40, md: 48 },
              background:
                "linear-gradient(45deg, var(--primary-neon), var(--secondary-neon))",
              border: "2px solid var(--primary-neon)",
              color: "var(--bg-primary)",
              fontFamily: "var(--font-secondary)",
              fontWeight: "bold",
              fontSize: { xs: "1rem", md: "1.2rem" },
            }}
          >
            {user?.username?.charAt(0).toUpperCase()}
          </Avatar>

          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography
              variant="subtitle1"
              sx={{
                color: "var(--text-primary)",
                fontFamily: "var(--font-secondary)",
                fontWeight: "bold",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                fontSize: { xs: "0.9rem", md: "1rem" },
              }}
            >
              {user?.first_name && user?.last_name
                ? `${user.first_name} ${user.last_name}`
                : user?.username}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: "var(--text-secondary)",
                fontFamily: "var(--font-primary)",
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
                display: "block",
                fontSize: { xs: "0.75rem", md: "0.8rem" },
              }}
            >
              @{user?.username}
            </Typography>
          </Box>

          <IconButton
            size="small"
            sx={{
              color: "var(--primary-neon)",
              border: "1px solid var(--primary-neon)",
              borderRadius: "50%",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "var(--glow-soft)",
                transform: "rotate(90deg)",
              },
              width: { xs: 32, md: 36 },
              height: { xs: 32, md: 36 },
            }}
          >
            <SettingsIcon sx={{ fontSize: { xs: "1rem", md: "1.2rem" } }} />
          </IconButton>
        </Box>
      </Box>

      {/* User Menu */}
      <Menu
        anchorEl={userMenuAnchor}
        open={Boolean(userMenuAnchor)}
        onClose={handleUserMenuClose}
        PaperProps={{
          className: "cyber-card",
          sx: {
            background: "rgba(30, 30, 46, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(0, 255, 255, 0.3)",
            borderRadius: "12px",
            boxShadow: "var(--glow-soft)",
            mt: 1,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "bottom" }}
        anchorOrigin={{ horizontal: "right", vertical: "top" }}
      >
        <MenuItem
          onClick={handleProfileClick}
          sx={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-primary)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "rgba(0, 255, 255, 0.1)",
              color: "var(--primary-neon)",
            },
            fontSize: { xs: "0.9rem", md: "1rem" },
          }}
        >
          <AccountIcon sx={{ mr: 1, color: "var(--primary-neon)" }} />
          Edit Profile
        </MenuItem>
        <MenuItem
          onClick={handleLogout}
          sx={{
            color: "var(--text-primary)",
            fontFamily: "var(--font-primary)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "rgba(255, 0, 0, 0.1)",
              color: "#ff0000",
            },
            fontSize: { xs: "0.9rem", md: "1rem" },
          }}
        >
          <LogoutIcon sx={{ mr: 1, color: "#ff0000" }} />
          Logout
        </MenuItem>
      </Menu>

      {/* User Profile Dialog */}
      <UserProfile
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
      />
    </Box>
  );
};

export default ChatSidebar;
