import React from "react";
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link as MuiLink,
} from "@mui/material";
import {
  GitHub,
  LinkedIn,
  Email,
  Twitter,
  Facebook,
  Instagram,
} from "@mui/icons-material";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12} sx={{ textAlign: "center" }}>
          <MuiLink
            component={Link}
            to="/dashboard"
            sx={{
              display: "inline-block",
              padding: "12px 24px",
              background:
                "linear-gradient(45deg, transparent, rgba(0, 255, 255, 0.1))",
              border: "1px solid var(--primary-neon)",
              color: "var(--primary-neon)",
              fontFamily: "'Orbitron', 'Arial', sans-serif",
              fontWeight: "bold",
              textTransform: "uppercase",
              letterSpacing: "1px",
              textDecoration: "none",
              borderRadius: "4px",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow:
                  "0 0 10px var(--primary-neon), 0 0 20px var(--primary-neon), 0 0 30px var(--primary-neon)",
                transform: "translateY(-2px)",
                background:
                  "linear-gradient(45deg, transparent, rgba(0, 255, 255, 0.2))",
              },
            }}
          >
            ← Back to Dashboard
          </MuiLink>
        </Grid>
        <Grid item xs={12}>
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
              variant="h3"
              className="glitch"
              data-text="K9TX Chat"
              sx={{
                fontFamily: "'Orbitron', 'Arial', sans-serif",
                color: "var(--primary-neon)",
                textShadow:
                  "0 0 5px var(--primary-neon), 0 0 10px var(--primary-neon)",
                mb: 2,
                textAlign: "center",
              }}
            >
              K9TX Chat
            </Typography>
            <Typography
              variant="h5"
              sx={{
                color: "var(--text-primary)",
                mb: 3,
                textAlign: "center",
                fontFamily: "'Space Mono', 'Courier New', monospace",
              }}
            >
              Real-Time Communication Platform
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "var(--text-secondary)",
                mb: 2,
                textAlign: "center",
                lineHeight: 1.6,
                maxWidth: "800px",
                margin: "0 auto 20px",
              }}
            >
              K9TX Chat is a cutting-edge real-time communication platform that
              connects people instantly. Built with modern technologies, it
              provides a seamless chatting experience with advanced features and
              a futuristic interface.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
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
              variant="h5"
              className="glow-text"
              sx={{
                fontFamily: "'Orbitron', 'Arial', sans-serif",
                mb: 2,
                color: "var(--primary-neon)",
              }}
            >
              Features
            </Typography>
            <List>
              {[
                "Real-time messaging with WebSocket technology",
                "Secure user authentication and verification",
                "End-to-end encryption for private conversations",
                "Multi-device synchronization",
                "File sharing capabilities",
                "Customizable user profiles",
                "Group chat functionality",
                "Emoji and GIF support",
              ].map((feature, index) => (
                <ListItem key={index} sx={{ py: 0.5 }}>
                  <ListItemIcon sx={{ minWidth: 30 }}>
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "var(--primary-neon)",
                        boxShadow: "0 0 10px var(--primary-neon)",
                      }}
                    />
                  </ListItemIcon>
                  <ListItemText
                    primary={feature}
                    sx={{ color: "var(--text-primary)" }}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
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
              variant="h5"
              className="glow-text"
              sx={{
                fontFamily: "'Orbitron', 'Arial', sans-serif",
                mb: 2,
                color: "var(--primary-neon)",
              }}
            >
              Connect With Us
            </Typography>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Email sx={{ color: "var(--primary-neon)" }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <MuiLink
                      href="mailto:support@k9txchat.com"
                      sx={{
                        color: "var(--primary-neon)",
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline",
                          textShadow: "0 0 5px var(--primary-neon)",
                        },
                      }}
                    >
                      support@k9txchat.com
                    </MuiLink>
                  }
                  sx={{ color: "var(--text-primary)" }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <GitHub sx={{ color: "var(--primary-neon)" }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <MuiLink
                      href="https://github.com/k9tx"
                      target="_blank"
                      sx={{
                        color: "var(--primary-neon)",
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline",
                          textShadow: "0 0 5px var(--primary-neon)",
                        },
                      }}
                    >
                      Github
                    </MuiLink>
                  }
                  sx={{ color: "var(--text-primary)" }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <LinkedIn sx={{ color: "var(--primary-neon)" }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <MuiLink
                      href="https://linkedin.com/in/k9tx"
                      target="_blank"
                      sx={{
                        color: "var(--primary-neon)",
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline",
                          textShadow: "0 0 5px var(--primary-neon)",
                        },
                      }}
                    >
                      Linkedin
                    </MuiLink>
                  }
                  sx={{ color: "var(--text-primary)" }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Twitter sx={{ color: "var(--primary-neon)" }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <MuiLink
                      href="https://x.com/k9txs"
                      target="_blank"
                      sx={{
                        color: "var(--primary-neon)",
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline",
                          textShadow: "0 0 5px var(--primary-neon)",
                        },
                      }}
                    >
                      Twitter
                    </MuiLink>
                  }
                  sx={{ color: "var(--text-primary)" }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Facebook sx={{ color: "var(--primary-neon)" }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <MuiLink
                      href="https://facebook.com/k9txchat"
                      target="_blank"
                      sx={{
                        color: "var(--primary-neon)",
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline",
                          textShadow: "0 0 5px var(--primary-neon)",
                        },
                      }}
                    >
                      Facebook
                    </MuiLink>
                  }
                  sx={{ color: "var(--text-primary)" }}
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Instagram sx={{ color: "var(--primary-neon)" }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <MuiLink
                      href="https://instagram.com/kartik9t.xs"
                      target="_blank"
                      sx={{
                        color: "var(--primary-neon)",
                        textDecoration: "none",
                        "&:hover": {
                          textDecoration: "underline",
                          textShadow: "0 0 5px var(--primary-neon)",
                        },
                      }}
                    >
                      Instagram
                    </MuiLink>
                  }
                  sx={{ color: "var(--text-primary)" }}
                />
              </ListItem>
            </List>
          </Paper>
        </Grid>

        <Grid item xs={12}>
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
              variant="h5"
              className="glow-text"
              sx={{
                fontFamily: "'Orbitron', 'Arial', sans-serif",
                mb: 2,
                color: "var(--primary-neon)",
              }}
            >
              Our Mission
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "var(--text-secondary)",
                mb: 2,
                lineHeight: 1.6,
              }}
            >
              At K9TX Chat, we believe in the power of real-time communication
              to bring people together. Our mission is to provide a secure,
              fast, and intuitive platform that enables meaningful connections
              between individuals and communities around the world.
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "var(--text-secondary)",
                lineHeight: 1.6,
              }}
            >
              We are committed to continuous innovation, user privacy, and
              creating an inclusive environment where everyone can communicate
              freely and safely. if you want to share files more than 10MB then
              you can click on phone icon on chat window and you'll redirect to
              out site.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default About;
