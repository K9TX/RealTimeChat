import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Alert,
  Snackbar,
  Fade,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useChatContext } from "../../contexts/ChatContext";
import ChatSidebar from "./ChatSidebar";
import ChatWindow from "./ChatWindow";
import UserSearchDialog from "./UserSearchDialog";
import "../../theme.css";

// Matrix Rain Component for background effect
const MatrixRain = () => {
  useEffect(() => {
    const characters = "0123456789ABCDEF";
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    const updateCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      canvas.style.position = "fixed";
      canvas.style.top = "0";
      canvas.style.left = "0";
      canvas.style.zIndex = "-1";
      canvas.style.pointerEvents = "none";
      canvas.style.opacity = "0.1";
    };

    updateCanvas();
    document.body.appendChild(canvas);

    const drops = [];
    const columns = Math.floor(canvas.width / 10);

    for (let i = 0; i < columns; i++) {
      drops[i] = Math.random() * canvas.height;
    }

    const draw = () => {
      ctx.fillStyle = "rgba(10, 10, 15, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00ffff";
      ctx.font = "10px Space Mono";

      for (let i = 0; i < drops.length; i++) {
        const text = characters[Math.floor(Math.random() * characters.length)];
        ctx.fillText(text, i * 10, drops[i]);

        if (drops[i] * 10 > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 33);

    const handleResize = () => updateCanvas();
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
      if (document.body.contains(canvas)) {
        document.body.removeChild(canvas);
      }
    };
  }, []);

  return null;
};

// Connection Status Component
const ConnectionStatus = ({ connected, room }) => {
  if (!room) return null;

  return (
    <Box
      className="connection-indicator fade-in-up"
      sx={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 1000,
        background: "rgba(30, 30, 46, 0.9)",
        backdropFilter: "blur(10px)",
        border: `1px solid ${
          connected ? "var(--success-neon)" : "var(--warning-neon)"
        }`,
        borderRadius: "25px",
        padding: "8px 16px",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      <div
        className={`connection-dot ${connected ? "connected" : "connecting"}`}
      />
      <Typography
        variant="caption"
        sx={{
          color: connected ? "var(--success-neon)" : "var(--warning-neon)",
          fontFamily: "var(--font-secondary)",
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {connected ? "ONLINE" : "CONNECTING"}
      </Typography>
    </Box>
  );
};

// Loading Component with Cyber styling
const CyberLoader = () => (
  <Box
    sx={{
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 3,
    }}
  >
    <div className="cyber-loader" />
    <Typography
      variant="h6"
      className="glow-text"
      sx={{ fontFamily: "var(--font-secondary)" }}
    >
      INITIALIZING...
    </Typography>
  </Box>
);

// Welcome Screen Component
const WelcomeScreen = () => (
  <Box
    className="fade-in-up"
    sx={{
      height: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "column",
      gap: 3,
      padding: 4,
      textAlign: "center",
    }}
  >
    <Typography
      variant="h3"
      className="glitch"
      data-text="REALCHAT"
      sx={{
        fontFamily: "var(--font-secondary)",
        fontWeight: 900,
        marginBottom: 2,
      }}
    >
      REALCHAT
    </Typography>

    <Typography
      variant="h6"
      sx={{
        color: "var(--text-secondary)",
        fontFamily: "var(--font-primary)",
        opacity: 0.8,
        animation: "fadeInUp 0.5s ease-out 0.5s both",
      }}
    >
      Neural Communication Interface
    </Typography>

    <Typography
      variant="body1"
      sx={{
        color: "var(--text-muted)",
        fontFamily: "var(--font-primary)",
        animation: "fadeInUp 0.5s ease-out 1s both",
      }}
    >
      Select a conversation to establish connection
    </Typography>

    <Box
      className="retro-grid"
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: 0.1,
        zIndex: -1,
      }}
    />
  </Box>
);

const ChatInterface = () => {
  const { currentRoom, error, loading, wsConnected, clearError } =
    useChatContext();
  const [searchDialogOpen, setSearchDialogOpen] = useState(false);
  const [showError, setShowError] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

 
  const handleMobileBack = () => {
    setMobileSidebarOpen(true); 
  };

  const handleMobileChatSelect = () => {
    setMobileSidebarOpen(false); 
  };

 
  useEffect(() => {
    if (currentRoom) {
      setMobileSidebarOpen(false);
    }
  }, [currentRoom]);

  useEffect(() => {
    if (error) {
      setShowError(true);
    }
  }, [error]);

  const handleCloseError = () => {
    setShowError(false);
    setTimeout(() => clearError(), 300);
  };

  return (
    <>
      <MatrixRain />

      <Box
        sx={{
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "transparent",
          padding: { xs: 0, md: "20px" }, 
        }}
      >
        {/* Connection Status */}
        <ConnectionStatus connected={wsConnected} room={currentRoom} />

        {/* Error Snackbar */}
        <Snackbar
          open={showError && !!error}
          autoHideDuration={6000}
          onClose={handleCloseError}
          anchorOrigin={{ vertical: "top", horizontal: "center" }}
          TransitionComponent={Fade}
        >
          <Alert
            severity="error"
            onClose={handleCloseError}
            sx={{
              background:
                "linear-gradient(45deg, rgba(255, 0, 0, 0.2), rgba(255, 0, 0, 0.1))",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255, 0, 0, 0.3)",
              color: "var(--text-primary)",
              "& .MuiAlert-icon": {
                color: "#ff0000",
              },
            }}
          >
            {error}
          </Alert>
        </Snackbar>

        
        <Paper
          className="cyber-card chat-container"
          elevation={0}
          sx={{
            flexGrow: 1,
            overflow: "hidden",
            background: "transparent",
            borderRadius: { xs: 0, md: "12px" },
            margin: { xs: 0, md: 0 }, 
          }}
        >
          <Box
            sx={{
              display: "flex",
              height: "100%",
              flexDirection: { xs: "column", md: "row" }, 
            }}
          >
           
            <Box
              sx={{
                width: { xs: "100%", md: "35%" }, 
                maxWidth: { md: "400px" }, 
                height: { xs: "100%", md: "100%" },
                borderRight: { md: "1px solid rgba(0, 255, 255, 0.2)" },
                display: {
                  xs: mobileSidebarOpen || !currentRoom ? "block" : "none",
                  md: "block",
                },
                background: "var(--bg-primary)",
              }}
            >
              <ChatSidebar
                onSearchClick={() => setSearchDialogOpen(true)}
                onChatSelect={handleMobileChatSelect}
                onMobileClose={() => setMobileSidebarOpen(false)}
              />
            </Box>

           
            <Box
              sx={{
                flexGrow: 1,
                height: { xs: "100%", md: "100%" },
                display: {
                  xs: mobileSidebarOpen || !currentRoom ? "none" : "flex",
                  md: "flex",
                }, 
                width: { xs: "100%", md: "auto" },
                minWidth: 0,
                flexDirection: "column", 
              }}
            >
              {currentRoom ? (
                <ChatWindow
                  onMobileBack={handleMobileBack}
                  onSearchClick={() => setSearchDialogOpen(true)}
                />
              ) : loading ? (
                <CyberLoader />
              ) : (
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
                      onClick={() => setMobileSidebarOpen(true)}
                      sx={{
                        display: { xs: "flex", md: "none" }, 
                        color: "var(--primary-neon)",
                        "&:hover": {
                          transform: "scale(1.1)",
                          color: "var(--text-neon)",
                        },
                      }}
                    >
                      <SearchIcon />
                    </IconButton>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography
                        variant="h6"
                        sx={{
                          color: "var(--text-neon)",
                          fontFamily: "var(--font-secondary)",
                          fontWeight: "bold",
                        }}
                      >
                        Chats
                      </Typography>
                    </Box>
                  </Box>

                  <WelcomeScreen />
                </Box>
              )}
            </Box>

           
            <UserSearchDialog
              open={searchDialogOpen}
              onClose={() => setSearchDialogOpen(false)}
            />
          </Box>
        </Paper>

        <UserSearchDialog
          open={searchDialogOpen}
          onClose={() => setSearchDialogOpen(false)}
        />
      </Box>
    </>
  );
};

export default ChatInterface;
