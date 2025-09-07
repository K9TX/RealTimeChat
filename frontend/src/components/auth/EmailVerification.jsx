import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
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
  CircularProgress,
} from "@mui/material";
import { useAuth } from "../../contexts/AuthContext";

const EmailVerification = () => {
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const { verifyEmail, sendVerificationEmail } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get email from navigation state or URL params
  const emailFromState = location.state?.email || "";

  const formik = useFormik({
    initialValues: {
      email: emailFromState,
      otp: "",
    },
    validationSchema: Yup.object({
      email: Yup.string().email("Invalid email address").required("Required"),
      otp: Yup.string()
        .required("Required")
        .matches(/^\d{6}$/, "OTP must be exactly 6 digits"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      setError("");
      setSuccess("");

      try {
        await verifyEmail(values.email, values.otp);
        setSuccess("Email verified successfully! You can now sign in.");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      } catch (err) {
        setError(err.response?.data?.error || "Failed to verify email");
      } finally {
        setLoading(false);
      }
    },
  });

  const handleResendOTP = async () => {
    if (!formik.values.email) {
      setError("Please enter your email address first");
      return;
    }

    setResendLoading(true);
    setError("");
    setSuccess("");

    try {
      await sendVerificationEmail(formik.values.email);
      setSuccess(
        "Verification OTP sent successfully! Please check your email."
      );
    } catch (err) {
      setError(
        err.response?.data?.error || "Failed to send verification email"
      );
    } finally {
      setResendLoading(false);
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
            data-text="Verify Your Email"
            sx={{
              fontFamily: "'Orbitron', 'Arial', sans-serif",
              color: "var(--primary-neon)",
              textShadow:
                "0 0 5px var(--primary-neon), 0 0 10px var(--primary-neon)",
              mb: 2,
            }}
          >
            Verify Your Email
          </Typography>
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              mb: 2,
              textAlign: "center",
              color: "var(--text-primary)", // Changed to white text
              fontFamily: "'Space Mono', 'Courier New', monospace",
            }}
          >
            We've sent a verification code to your email. Please enter it below
            to verify your account.
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
          {success && (
            <Alert
              severity="success"
              sx={{
                mt: 2,
                width: "100%",
                background: "rgba(30, 30, 46, 0.8)",
                color: "var(--text-primary)",
                border: "1px solid rgba(0, 255, 0, 0.3)",
              }}
            >
              {success}
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
              className="cyber-input"
              value={formik.values.email}
              onChange={formik.handleChange}
              error={formik.touched.email && Boolean(formik.errors.email)}
              helperText={formik.touched.email && formik.errors.email}
              disabled={!!emailFromState} // Disable if email came from registration
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
              id="otp"
              label="Verification Code"
              name="otp"
              autoComplete="off"
              autoFocus
              className="cyber-input"
              inputProps={{
                maxLength: 6,
                style: {
                  textAlign: "center",
                  fontSize: "1.2em",
                  letterSpacing: "0.5em",
                },
              }}
              value={formik.values.otp}
              onChange={formik.handleChange}
              error={formik.touched.otp && Boolean(formik.errors.otp)}
              helperText={formik.touched.otp && formik.errors.otp}
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
              disabled={loading || resendLoading}
            >
              {loading ? (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                  Verifying...
                </Box>
              ) : (
                "Verify Email"
              )}
            </Button>

            <Box
              sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 1 }}
            >
              <Button
                fullWidth
                variant="outlined"
                onClick={handleResendOTP}
                disabled={resendLoading || loading}
                className="cyber-button"
                sx={{
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
              >
                {resendLoading ? (
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <CircularProgress size={20} />
                    Sending...
                  </Box>
                ) : (
                  "Resend Verification Code"
                )}
              </Button>

              <Box sx={{ textAlign: "center", mt: 2 }}>
                <MuiLink
                  component={Link}
                  to="/login"
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
                  Back to Sign In
                </MuiLink>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default EmailVerification;
