import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  CircularProgress,
  Box,
  IconButton,
} from "@mui/material";
import { Close as CloseIcon, Search as SearchIcon } from "@mui/icons-material";
import { useChatContext } from "../../contexts/ChatContext";
import { useAuth } from "../../contexts/AuthContext";

const UserSearchDialog = ({ open, onClose }) => {
  const { user } = useAuth();
  const {
    searchUsers,
    searchResults,
    searchLoading,
    createPrivateChat,
    selectRoom,
  } = useChatContext();
  const [query, setQuery] = useState("");
  const [debounceTimer, setDebounceTimer] = useState(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    if (query.trim()) {
      const timer = setTimeout(() => {
        searchUsers(query.trim());
      }, 300); // 300ms debounce

      setDebounceTimer(timer);
    } else {
      searchUsers(""); // Clear results
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
    };
  }, [query]);

  // Focus the search input when dialog opens
  useEffect(() => {
    if (open && searchInputRef.current) {
      // Delay focus to ensure the dialog is fully rendered
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleUserSelect = async (selectedUser) => {
    try {
      const room = await createPrivateChat(selectedUser.id);
      selectRoom(room);
      onClose();
      setQuery("");
    } catch (error) {
      console.error("Error creating private chat:", error);
    }
  };

  const handleClose = () => {
    // Blur the input before closing to prevent focus issues
    if (searchInputRef.current) {
      searchInputRef.current.blur();
    }
    setQuery("");
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { minHeight: "400px" },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "darkslategray",
        }}
      >
        Search Users
        <IconButton onClick={handleClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        {/* Search Input */}
        <TextField
          inputRef={searchInputRef}
          fullWidth
          placeholder="Search by username, first name, or last name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />
            ),
          }}
          sx={{ mb: 2 }}
        />

        {/* Search Results */}
        <Box sx={{ minHeight: "300px" }}>
          {searchLoading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "200px",
              }}
            >
              <CircularProgress />
            </Box>
          ) : !query.trim() ? (
            <Box sx={{ textAlign: "center", pt: 4 }}>
              <SearchIcon
                sx={{ fontSize: 64, color: "text.secondary", mb: 2 }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Find someone to chat with
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Type a username or name to start searching
              </Typography>
            </Box>
          ) : searchResults.length === 0 ? (
            <Box sx={{ textAlign: "center", pt: 4 }}>
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No users found
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Try searching with a different term
              </Typography>
            </Box>
          ) : (
            <List sx={{ pt: 0 }}>
              {searchResults.map((searchUser) => (
                <ListItem key={searchUser.id} disablePadding>
                  <ListItemButton
                    onClick={() => handleUserSelect(searchUser)}
                    disabled={searchUser.id === user?.id}
                    sx={{
                      borderRadius: 1,
                      mb: 1,
                      "&:hover": {
                        bgcolor: "primary.light",
                      },
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: "primary.main" }}>
                        {searchUser.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1" fontWeight={500}>
                          {searchUser.first_name && searchUser.last_name
                            ? `${searchUser.first_name} ${searchUser.last_name}`
                            : searchUser.username}
                        </Typography>
                      }
                      secondary={
                        <Typography variant="body2" color="text.secondary">
                          @{searchUser.username}
                          {searchUser.first_name && searchUser.last_name && (
                            <>
                              {" • "}
                              {searchUser.first_name} {searchUser.last_name}
                            </>
                          )}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default UserSearchDialog;
