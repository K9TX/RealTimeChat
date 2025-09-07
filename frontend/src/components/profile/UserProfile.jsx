import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  IconButton,
  Alert,
  Fade,
  CircularProgress,
  Divider
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import { useChatContext } from '../../contexts/ChatContext';

const UserProfile = ({ open, onClose }) => {
  const { user, updateUsername, logout } = useAuth();
  const { refreshUserData } = useChatContext();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Reset states when dialog opens/closes
  React.useEffect(() => {
    if (open) {
      setNewUsername(user?.username || '');
      setIsEditing(false);
      setMessage('');
      setError('');
    }
  }, [open, user?.username]);

  const handleStartEdit = () => {
    setIsEditing(true);
    setMessage('');
    setError('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewUsername(user?.username || '');
    setMessage('');
    setError('');
  };

  const handleSaveUsername = async () => {
    if (!newUsername.trim()) {
      setError('Username cannot be empty');
      return;
    }

    if (newUsername === user?.username) {
      setIsEditing(false);
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const result = await updateUsername(newUsername.trim());
      setMessage('Username updated successfully!');
      setIsEditing(false);
      
      // Refresh chat data to show updated username everywhere
      if (result.user) {
        refreshUserData(result.user);
      }
      
      // Clear message after 3 seconds
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.username?.[0] || 
                          err.response?.data?.error || 
                          'Failed to update username. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !loading) {
      e.preventDefault();
      handleSaveUsername();
    }
    if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  if (!user) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        className: 'cyber-card',
        sx: {
          background: 'rgba(30, 30, 46, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(0, 255, 255, 0.3)',
          borderRadius: '20px',
          boxShadow: 'var(--glow-soft)',
          overflow: 'hidden'
        }
      }}
      TransitionComponent={Fade}
      transitionDuration={300}
    >
      {/* Header with glow effect */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '3px',
          background: 'linear-gradient(90deg, var(--primary-neon), var(--secondary-neon), var(--primary-neon))',
          boxShadow: 'var(--glow-soft)'
        }}
      />
      
      <DialogTitle
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(45deg, rgba(0, 255, 255, 0.1), rgba(255, 0, 255, 0.1))',
          borderBottom: '1px solid rgba(0, 255, 255, 0.2)',
          pt: 3
        }}
      >
        <Typography
          variant="h5"
          className="glitch"
          data-text="USER PROFILE"
          sx={{
            fontFamily: 'var(--font-secondary)',
            fontWeight: 'bold',
            color: 'var(--text-neon)',
            textShadow: 'var(--glow-soft)'
          }}
        >
          USER PROFILE
        </Typography>
        <IconButton
          onClick={onClose}
          sx={{
            color: 'var(--text-secondary)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            transition: 'all 0.3s ease',
            '&:hover': {
              color: 'var(--primary-neon)',
              borderColor: 'var(--primary-neon)',
              boxShadow: 'var(--glow-soft)'
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 3 }}>
        {/* User Avatar Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4
          }}
        >
          <Avatar
            className="cyber-avatar pulse"
            sx={{
              width: 120,
              height: 120,
              fontSize: '2.5rem',
              background: 'linear-gradient(45deg, var(--primary-neon), var(--secondary-neon))',
              border: '3px solid var(--primary-neon)',
              color: 'var(--bg-primary)',
              fontFamily: 'var(--font-secondary)',
              fontWeight: 'bold',
              mb: 2,
              boxShadow: 'var(--glow-primary)'
            }}
          >
            {user.username?.charAt(0).toUpperCase()}
          </Avatar>
          
          <Typography
            variant="h6"
            sx={{
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-secondary)',
              textAlign: 'center',
              mb: 1
            }}
          >
            {user.first_name && user.last_name 
              ? `${user.first_name} ${user.last_name}` 
              : user.username}
          </Typography>
        </Box>

        {/* Success/Error Messages */}
        {message && (
          <Fade in={!!message}>
            <Alert
              severity="success"
              sx={{
                mb: 2,
                background: 'linear-gradient(45deg, rgba(0, 255, 0, 0.2), rgba(0, 255, 0, 0.1))',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--success-neon)',
                color: 'var(--text-primary)',
                '& .MuiAlert-icon': {
                  color: 'var(--success-neon)'
                }
              }}
            >
              {message}
            </Alert>
          </Fade>
        )}

        {error && (
          <Fade in={!!error}>
            <Alert
              severity="error"
              sx={{
                mb: 2,
                background: 'linear-gradient(45deg, rgba(255, 0, 0, 0.2), rgba(255, 0, 0, 0.1))',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255, 0, 0, 0.3)',
                color: 'var(--text-primary)',
                '& .MuiAlert-icon': {
                  color: '#ff0000'
                }
              }}
            >
              {error}
            </Alert>
          </Fade>
        )}

        {/* Profile Information */}
        <Box sx={{ space: 3 }}>
          {/* Email Field (Read-only) */}
          <Box sx={{ mb: 3 }}>
            <Typography
              variant="subtitle2"
              sx={{
                color: 'var(--text-secondary)',
                fontFamily: 'var(--font-secondary)',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                mb: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <EmailIcon sx={{ fontSize: '1rem' }} />
              Email Address
            </Typography>
            <Box
              className="cyber-card"
              sx={{
                p: 2,
                background: 'rgba(50, 50, 70, 0.5)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px'
              }}
            >
              <Typography
                variant="body1"
                sx={{
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-primary)'
                }}
              >
                {user.email}
              </Typography>
            </Box>
          </Box>

          {/* Username Field */}
          <Box sx={{ mb: 3 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                mb: 1
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  color: 'var(--text-secondary)',
                  fontFamily: 'var(--font-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <PersonIcon sx={{ fontSize: '1rem' }} />
                Username
              </Typography>
              
              {!isEditing && (
                <IconButton
                  onClick={handleStartEdit}
                  size="small"
                  sx={{
                    color: 'var(--primary-neon)',
                    border: '1px solid var(--primary-neon)',
                    borderRadius: '8px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: 'var(--glow-soft)',
                      transform: 'scale(1.05)'
                    }
                  }}
                >
                  <EditIcon sx={{ fontSize: '1rem' }} />
                </IconButton>
              )}
            </Box>

            {isEditing ? (
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <TextField
                  fullWidth
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Enter new username..."
                  disabled={loading}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      background: 'rgba(30, 30, 46, 0.8)',
                      border: '1px solid var(--primary-neon)',
                      borderRadius: '12px',
                      color: 'var(--text-primary)',
                      fontFamily: 'var(--font-primary)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: 'var(--glow-soft)',
                      '& fieldset': {
                        border: 'none'
                      },
                      '&:hover': {
                        borderColor: 'var(--primary-neon)',
                        boxShadow: 'var(--glow-soft)'
                      },
                      '&.Mui-focused': {
                        borderColor: 'var(--primary-neon)',
                        boxShadow: 'var(--glow-primary)'
                      }
                    },
                    '& .MuiOutlinedInput-input': {
                      color: 'var(--text-primary)',
                      '&::placeholder': {
                        color: 'var(--text-muted)',
                        opacity: 0.8
                      }
                    }
                  }}
                />
                
                <IconButton
                  onClick={handleSaveUsername}
                  disabled={loading || !newUsername.trim()}
                  sx={{
                    width: 40,
                    height: 40,
                    background: 'linear-gradient(45deg, var(--success-neon), var(--primary-neon))',
                    color: 'var(--bg-primary)',
                    border: '1px solid var(--success-neon)',
                    borderRadius: '10px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 0 15px var(--success-neon)',
                      transform: 'scale(1.1)'
                    },
                    '&:disabled': {
                      opacity: 0.5,
                      background: 'rgba(128, 128, 128, 0.2)',
                      color: 'var(--text-muted)'
                    }
                  }}
                >
                  {loading ? (
                    <CircularProgress size={20} sx={{ color: 'inherit' }} />
                  ) : (
                    <SaveIcon sx={{ fontSize: '1.2rem' }} />
                  )}
                </IconButton>
                
                <IconButton
                  onClick={handleCancelEdit}
                  disabled={loading}
                  sx={{
                    width: 40,
                    height: 40,
                    background: 'rgba(255, 0, 0, 0.2)',
                    color: '#ff0000',
                    border: '1px solid rgba(255, 0, 0, 0.3)',
                    borderRadius: '10px',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: '0 0 15px rgba(255, 0, 0, 0.3)',
                      transform: 'scale(1.1)'
                    }
                  }}
                >
                  <CancelIcon sx={{ fontSize: '1.2rem' }} />
                </IconButton>
              </Box>
            ) : (
              <Box
                className="cyber-card"
                sx={{
                  p: 2,
                  background: 'rgba(30, 30, 46, 0.8)',
                  border: '1px solid rgba(0, 255, 255, 0.2)',
                  borderRadius: '12px',
                  transition: 'all 0.3s ease',
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: 'var(--primary-neon)',
                    boxShadow: 'var(--glow-soft)'
                  }
                }}
                onClick={handleStartEdit}
              >
                <Typography
                  variant="body1"
                  sx={{
                    color: 'var(--text-primary)',
                    fontFamily: 'var(--font-primary)',
                    fontWeight: 'bold'
                  }}
                >
                  @{user.username}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Additional Info */}
          <Divider
            sx={{
              mb: 3,
              background: 'linear-gradient(90deg, transparent, var(--primary-neon), transparent)',
              height: '1px',
              border: 'none'
            }}
          />
          
          <Typography
            variant="body2"
            sx={{
              color: 'var(--text-muted)',
              fontFamily: 'var(--font-primary)',
              textAlign: 'center',
              lineHeight: 1.6
            }}
          >
            Your username is visible to other users in chat rooms. 
            Choose a unique identifier that represents you in the network.
          </Typography>
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          pt: 0,
          justifyContent: 'center'
        }}
      >
        <Button
          onClick={onClose}
          className="cyber-button"
          sx={{
            minWidth: 120,
            background: 'linear-gradient(45deg, transparent, rgba(0, 255, 255, 0.1))',
            border: '1px solid var(--primary-neon)',
            color: 'var(--primary-neon)',
            borderRadius: '12px',
            fontFamily: 'var(--font-secondary)',
            fontWeight: 'bold',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: 'var(--glow-primary)',
              transform: 'translateY(-2px)'
            }
          }}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UserProfile;
