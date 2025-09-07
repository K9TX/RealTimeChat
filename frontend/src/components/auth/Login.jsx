import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  Paper,
  Link as MuiLink,
  Divider,
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import authService from "../../services/auth";

const Login = () => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, setUser } = useAuth();
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Required"),
      password: Yup.string().required("Required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError("");

      try {
        await login(values.email, values.password);
        navigate("/dashboard");
      } catch (err) {
        const errorData = err.response?.data;

        if (errorData?.requires_verification) {
          // User needs to verify email first
          setError(errorData.message || "Email verification required");
          // Optionally redirect to verification page
          setTimeout(() => {
            navigate("/verify-email", {
              state: {
                email: values.email,
                message: "Please verify your email before signing in",
              },
            });
          }, 2000);
        } else {
          setError(errorData?.error || "Invalid credentials");
        }
      } finally {
        setLoading(false);
      }
    },
  });

  const handleGoogleLogin = async (credentialResponse) => {
    setGoogleLoading(true);
    setError("");

    try {
      // Use the Google credential token directly
      const result = await authService.googleLogin(
        credentialResponse.credential
      );

      // Update auth context with the user data
      setUser(result.user);

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Google login failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          className="cyber-card fade-in-up"
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            background: "rgba(30, 30, 46, 0.8)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(0, 255, 255, 0.2)",
            borderRadius: "12px",
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
          }}
        >
          <Typography
            component="h1"
            variant="h5"
            className="glitch"
            data-text="Sign In"
            sx={{
              fontFamily: "'Orbitron', 'Arial', sans-serif",
              color: "var(--primary-neon)",
              textShadow:
                "0 0 5px var(--primary-neon), 0 0 10px var(--primary-neon)",
              mb: 2,
            }}
          >
            Sign in
          </Typography>
          {error && (
            <Alert
              severity="error"
              sx={{
                mt: 2,
                width: "100%",
                background: "rgba(30, 30, 46, 0.8)",
                color: "var(--text-primary)",
                border: "1px solid rgba(255, 0, 0, 0.3)",
              }}
            >
              {error}
            </Alert>
          )}
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ mt: 1, width: "100%" }}
          >
            <TextField
              margin="normal"
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              className="cyber-input"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(0, 255, 255, 0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "var(--primary-neon)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "var(--primary-neon)",
                    boxShadow: "0 0 15px rgba(0, 255, 255, 0.3)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "var(--text-primary)", // Changed to white text
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "var(--primary-neon)",
                },
                "& .MuiInputBase-input": {
                  color: "var(--text-primary)", // Changed to white text
                },
              }}
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              className="cyber-input"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              helperText={formik.touched.password && formik.errors.password}
              sx={{
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "rgba(0, 255, 255, 0.3)",
                  },
                  "&:hover fieldset": {
                    borderColor: "var(--primary-neon)",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "var(--primary-neon)",
                    boxShadow: "0 0 15px rgba(0, 255, 255, 0.3)",
                  },
                },
                "& .MuiInputLabel-root": {
                  color: "var(--text-primary)", // Changed to white text
                },
                "& .MuiInputLabel-root.Mui-focused": {
                  color: "var(--primary-neon)",
                },
                "& .MuiInputBase-input": {
                  color: "var(--text-primary)", // Changed to white text
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              className="cyber-button"
              sx={{
                mt: 3,
                mb: 2,
                background:
                  "linear-gradient(45deg, transparent, rgba(0, 255, 255, 0.1))",
                border: "1px solid var(--primary-neon)",
                color: "var(--text-primary)", // Changed to white text
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
              disabled={loading || googleLoading}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  Signing In...
                </Box>
              ) : (
                "Sign In"
              )}
            </Button>
            <Box
              sx={{ mt: 2, display: "flex", justifyContent: "space-between" }}
            >
              <MuiLink
                component={Link}
                to="/register"
                variant="body2"
                sx={{
                  color: "var(--primary-neon)",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                    textShadow: "0 0 5px var(--primary-neon)",
                  },
                }}
              >
                {"Don't have an account? Sign Up"}
              </MuiLink>
              <MuiLink
                component={Link}
                to="/forgot-password"
                variant="body2"
                sx={{
                  color: "var(--primary-neon)",
                  textDecoration: "none",
                  "&:hover": {
                    textDecoration: "underline",
                    textShadow: "0 0 5px var(--primary-neon)",
                  },
                }}
              >
                Forgot password?
              </MuiLink>
            </Box>
          </Box>

          <Divider
            sx={{
              mt: 3,
              mb: 2,
              width: "100%",
              "&::before, &::after": {
                borderColor: "rgba(0, 255, 255, 0.3)",
              },
            }}
          >
            <Typography
              sx={{
                color: "var(--text-primary)", // Changed to white text
                fontFamily: "'Orbitron', 'Arial', sans-serif",
              }}
            >
              OR
            </Typography>
          </Divider>

          <Box sx={{ display: "flex", justifyContent: "center" }}>
            {googleLoading ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, p: 1 }}>
                <CircularProgress size={20} />
                <Typography
                  variant="body2"
                  sx={{
                    color: "var(--text-primary)", // Changed to white text
                    fontFamily: "'Space Mono', 'Courier New', monospace",
                  }}
                >
                  Signing in with Google...
                </Typography>
              </Box>
            ) : (
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => {
                  setError("Google login failed. Please try again.");
                }}
                theme="outline"
                size="large"
                text="signin_with"
                useOneTap={false}
                auto_select={false}
              />
            )}
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Login;
