import React from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  AppBar,
  CssBaseline,
  IconButton,
  Divider,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import DashboardIcon from "@mui/icons-material/Dashboard";
import InfoIcon from "@mui/icons-material/Info";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";
import ChatIcon from "@mui/icons-material/Chat";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const drawerWidth = 240;

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar
        sx={{
          background:
            "linear-gradient(45deg, var(--primary-neon), var(--secondary-neon))",
          color: "var(--bg-primary)",
          minHeight: 64,
        }}
      >
        <Typography
          variant="h6"
          noWrap
          className="glitch"
          data-text="K9TX Chat"
          sx={{
            fontFamily: "'Orbitron', 'Arial', sans-serif",
            fontWeight: "bold",
            fontSize: "1.2rem",
          }}
        >
          K9TX Chat
        </Typography>
      </Toolbar>
      <Divider sx={{ borderColor: "rgba(0, 255, 255, 0.2)" }} />
      <List>
        <ListItem
          disablePadding
          sx={{
            transition: "all 0.3s ease",
          }}
        >
          <ListItemButton
            selected
            onClick={() => navigate("/dashboard")}
            sx={{
              transition: "all 0.3s ease",
              "&:hover": {
                background: "rgba(0, 255, 255, 0.1)",
                borderLeft: "3px solid var(--primary-neon)",
              },
              "&.Mui-selected": {
                background: "rgba(0, 255, 255, 0.2)",
                borderLeft: "3px solid var(--primary-neon)",
              },
            }}
          >
            <ListItemIcon>
              <DashboardIcon sx={{ color: "var(--primary-neon)" }} />
            </ListItemIcon>
            <ListItemText
              primary="Dashboard"
              sx={{
                color: "var(--text-primary)",
                fontFamily: "'Space Mono', 'Courier New', monospace",
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem
          disablePadding
          sx={{
            transition: "all 0.3s ease",
          }}
        >
          <ListItemButton
            onClick={() => navigate("/chat")}
            sx={{
              transition: "all 0.3s ease",
              "&:hover": {
                background: "rgba(0, 255, 255, 0.1)",
                borderLeft: "3px solid var(--primary-neon)",
              },
            }}
          >
            <ListItemIcon>
              <ChatIcon sx={{ color: "var(--primary-neon)" }} />
            </ListItemIcon>
            <ListItemText
              primary="Chat"
              sx={{
                color: "var(--text-primary)",
                fontFamily: "'Space Mono', 'Courier New', monospace",
              }}
            />
          </ListItemButton>
        </ListItem>
        <ListItem
          disablePadding
          sx={{
            transition: "all 0.3s ease",
          }}
        >
          <ListItemButton
            onClick={() => navigate("/about")}
            sx={{
              transition: "all 0.3s ease",
              "&:hover": {
                background: "rgba(0, 255, 255, 0.1)",
                borderLeft: "3px solid var(--primary-neon)",
              },
            }}
          >
            <ListItemIcon>
              <InfoIcon sx={{ color: "var(--primary-neon)" }} />
            </ListItemIcon>
            <ListItemText
              primary="About"
              sx={{
                color: "var(--text-primary)",
                fontFamily: "'Space Mono', 'Courier New', monospace",
              }}
            />
          </ListItemButton>
        </ListItem>

        <ListItem
          disablePadding
          sx={{
            transition: "all 0.3s ease",
          }}
        >
          <ListItemButton
            onClick={logout}
            sx={{
              transition: "all 0.3s ease",
              "&:hover": {
                background: "rgba(255, 0, 0, 0.1)",
                borderLeft: "3px solid #ff0000",
                boxShadow: "0 0 10px rgba(255, 0, 0, 0.3)",
              },
            }}
          >
            <ListItemIcon>
              <LogoutIcon sx={{ color: "#ff5555" }} />
            </ListItemIcon>
            <ListItemText
              primary="Logout"
              sx={{
                color: "var(--text-primary)",
                fontFamily: "'Space Mono', 'Courier New', monospace",
              }}
            />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        width: "100vw",
        background:
          "linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%)",
        backgroundAttachment: "fixed",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        overflow: "auto",
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.1) 0%, transparent 50%), " +
            "radial-gradient(circle at 80% 20%, rgba(255, 0, 255, 0.1) 0%, transparent 50%), " +
            "radial-gradient(circle at 40% 80%, rgba(255, 255, 0, 0.05) 0%, transparent 50%)",
          animation: "backgroundPulse 8s ease-in-out infinite alternate",
          pointerEvents: "none",
          zIndex: -1,
        },
        "&::-webkit-scrollbar": { display: "none" },
        msOverflowStyle: "none",
        scrollbarWidth: "none",
      }}
    >
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: "rgba(30, 30, 46, 0.8)",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(0, 255, 255, 0.2)",
        }}
        elevation={0}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{
              mr: 2,
              display: { sm: "none" },
              color: "var(--primary-neon)",
            }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            className="glow-text"
            sx={{
              fontFamily: "'Orbitron', 'Arial', sans-serif",
              color: "var(--primary-neon)",
            }}
          >
            Dashboard
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
        aria-label="mailbox folders"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              borderRight: "1px solid rgba(0, 255, 255, 0.2)",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              background: "var(--bg-secondary)",
              color: "var(--text-primary)",
              borderRight: "1px solid rgba(0, 255, 255, 0.2)",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
          <Grid container spacing={3}>
            {/* Welcome Section */}
            <Grid xs={12}>
              <Paper
                className="cyber-card"
                sx={{
                  p: 3,
                  background: "rgba(30, 30, 46, 0.8)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(0, 255, 255, 0.2)",
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                }}
              >
                <Typography
                  variant="h4"
                  gutterBottom
                  className="glow-text"
                  sx={{
                    fontFamily: "'Orbitron', 'Arial', sans-serif",
                    color: "var(--primary-neon)",
                    mb: 1,
                  }}
                >
                  Welcome back, {user?.username || "User"}!
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: "var(--text-secondary)",
                    fontFamily: "'Space Mono', 'Courier New', monospace",
                  }}
                >
                  Manage your account and profile settings from this dashboard.
                </Typography>
              </Paper>
            </Grid>

            {/* Quick Actions */}
            <Grid xs={12} md={6}>
              <Paper
                className="cyber-card"
                sx={{
                  p: 3,
                  height: "100%",
                  background: "rgba(30, 30, 46, 0.8)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(0, 255, 255, 0.2)",
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  className="glow-text"
                  sx={{
                    fontFamily: "'Orbitron', 'Arial', sans-serif",
                    color: "var(--primary-neon)",
                    mb: 2,
                  }}
                >
                  Quick Actions
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Button
                    variant="contained"
                    startIcon={<ChatIcon />}
                    onClick={() => navigate("/chat")}
                    className="cyber-button"
                    sx={{
                      background:
                        "linear-gradient(45deg, transparent, rgba(0, 255, 255, 0.1))",
                      border: "1px solid var(--primary-neon)",
                      color: "var(--primary-neon)",
                      padding: "12px 24px",
                      fontFamily: "'Orbitron', 'Arial', sans-serif",
                      fontWeight: "bold",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        boxShadow:
                          "0 0 10px var(--primary-neon), 0 0 20px var(--primary-neon), 0 0 30px var(--primary-neon)",
                        transform: "translateY(-2px)",
                        background:
                          "linear-gradient(45deg, transparent, rgba(0, 255, 255, 0.2))",
                      },
                      "&:active": {
                        transform: "translateY(0)",
                      },
                    }}
                  >
                    Go to Chat
                  </Button>
                </Box>
              </Paper>
            </Grid>

            <Grid xs={12} md={6}>
              <Paper
                className="cyber-card"
                sx={{
                  p: 3,
                  height: "100%",
                  background: "rgba(30, 30, 46, 0.8)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(0, 255, 255, 0.2)",
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  className="glow-text"
                  sx={{
                    fontFamily: "'Orbitron', 'Arial', sans-serif",
                    color: "var(--primary-neon)",
                    mb: 2,
                  }}
                >
                  Recent Activity
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "var(--text-secondary)",
                      fontFamily: "'Space Mono', 'Courier New', monospace",
                    }}
                  >
                    No recent activity.
                  </Typography>
                </Box>
              </Paper>
            </Grid>

            <Grid xs={12}>
              <Paper
                className="cyber-card"
                sx={{
                  p: 3,
                  background: "rgba(30, 30, 46, 0.8)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(0, 255, 255, 0.2)",
                  borderRadius: "12px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  className="glow-text"
                  sx={{
                    fontFamily: "'Orbitron', 'Arial', sans-serif",
                    color: "var(--primary-neon)",
                    mb: 2,
                  }}
                >
                  Profile Summary
                </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography
                    variant="body1"
                    sx={{
                      color: "var(--text-secondary)",
                      fontFamily: "'Space Mono', 'Courier New', monospace",
                    }}
                  >
                    Profile information will be displayed here.
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
