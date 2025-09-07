import React from "react";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import { AccountCircle, ExitToApp } from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          K9TXCHAT
        </Typography>
        {user && (
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <IconButton size="large" color="inherit">
              <AccountCircle />
            </IconButton>
            <Typography variant="body1" sx={{ mx: 2 }}>
              {user.email}
            </Typography>
            <Button
              color="inherit"
              onClick={handleLogout}
              startIcon={<ExitToApp />}
            >
              Logout
            </Button>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
