import React, { useState, useRef } from 'react';
import {
  Box,
  IconButton,
  Avatar,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Fade,
  Tooltip
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Delete as DeleteIcon,
  CloudUpload as CloudUploadIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

const ProfileImageUpload = ({ user, onImageUpdate, disabled = false }) => {
  const { uploadProfileImage, removeProfileImage } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please select JPEG, PNG, GIF, or WebP images.');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 5MB.');
      return;
    }

    setSelectedFile(file);
    setError('');
    setSuccess('');

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    setError('');

    try {
      const result = await uploadProfileImage(selectedFile);
      setSuccess('Profile image updated successfully!');
      setSelectedFile(null);
      setPreviewUrl(null);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Call parent callback
      if (onImageUpdate) {
        onImageUpdate(result.user);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.profile_image?.[0] || 
                          err.response?.data?.error || 
                          'Failed to upload image. Please try again.';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async () => {
    if (!user?.profile_image) return;

    setUploading(true);
    setError('');

    try {
      const result = await removeProfileImage();
      setSuccess('Profile image removed successfully!');
      
      // Call parent callback
      if (onImageUpdate) {
        onImageUpdate(result.user);
      }

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 
                          'Failed to remove image. Please try again.';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
    setSuccess('');
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getImageUrl = () => {
    if (previewUrl) return previewUrl;
    if (user?.profile_image) {
      // Handle both full URLs and relative paths
      if (user.profile_image.startsWith('http')) {
        return user.profile_image;
      }
      return `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:8000'}${user.profile_image}`;
    }
    return null;
  };

  return (
    <Box sx={{ textAlign: 'center' }}>
      {/* Success/Error Messages */}
      {success && (
        <Fade in={!!success}>
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
            {success}
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

      {/* Avatar with Upload Overlay */}
      <Box sx={{ position: 'relative', display: 'inline-block', mb: 2 }}>
        <Avatar
          src={getImageUrl()}
          className="cyber-avatar pulse"
          sx={{
            width: 120,
            height: 120,
            fontSize: '2.5rem',
            background: getImageUrl() 
              ? 'transparent' 
              : 'linear-gradient(45deg, var(--primary-neon), var(--secondary-neon))',
            border: '3px solid var(--primary-neon)',
            color: 'var(--bg-primary)',
            fontFamily: 'var(--font-secondary)',
            fontWeight: 'bold',
            boxShadow: 'var(--glow-primary)',
            opacity: uploading ? 0.7 : 1,
            transition: 'all 0.3s ease'
          }}
        >
          {!getImageUrl() && user?.username?.charAt(0).toUpperCase()}
        </Avatar>

        {/* Loading Overlay */}
        {uploading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(0, 0, 0, 0.7)',
              borderRadius: '50%'
            }}
          >
            <CircularProgress
              size={40}
              sx={{
                color: 'var(--primary-neon)'
              }}
            />
          </Box>
        )}

        {/* Camera Icon Overlay */}
        {!disabled && !uploading && (
          <Tooltip title="Change profile picture">
            <IconButton
              onClick={() => fileInputRef.current?.click()}
              sx={{
                position: 'absolute',
                bottom: -5,
                right: -5,
                background: 'linear-gradient(45deg, var(--primary-neon), var(--secondary-neon))',
                color: 'var(--bg-primary)',
                width: 40,
                height: 40,
                border: '2px solid var(--bg-primary)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  boxShadow: 'var(--glow-primary)',
                  transform: 'scale(1.1)'
                }
              }}
            >
              <PhotoCameraIcon sx={{ fontSize: '1.2rem' }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
        disabled={disabled || uploading}
      />

      {/* Action Buttons */}
      {selectedFile && (
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center', mb: 2 }}>
          <Button
            onClick={handleUpload}
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={16} /> : <CloudUploadIcon />}
            sx={{
              background: 'linear-gradient(45deg, var(--success-neon), var(--primary-neon))',
              color: 'var(--bg-primary)',
              border: '1px solid var(--success-neon)',
              borderRadius: '12px',
              fontFamily: 'var(--font-secondary)',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 0 15px var(--success-neon)',
                transform: 'translateY(-2px)'
              },
              '&:disabled': {
                opacity: 0.5,
                background: 'rgba(128, 128, 128, 0.2)',
                color: 'var(--text-muted)'
              }
            }}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </Button>

          <Button
            onClick={handleCancel}
            disabled={uploading}
            startIcon={<CancelIcon />}
            sx={{
              background: 'rgba(255, 0, 0, 0.2)',
              color: '#ff0000',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              borderRadius: '12px',
              fontFamily: 'var(--font-secondary)',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 0 15px rgba(255, 0, 0, 0.3)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            Cancel
          </Button>
        </Box>
      )}

      {/* Remove Button */}
      {user?.profile_image && !selectedFile && !disabled && (
        <Box sx={{ mt: 1 }}>
          <Button
            onClick={handleRemove}
            disabled={uploading}
            startIcon={uploading ? <CircularProgress size={16} /> : <DeleteIcon />}
            sx={{
              background: 'rgba(255, 0, 0, 0.2)',
              color: '#ff0000',
              border: '1px solid rgba(255, 0, 0, 0.3)',
              borderRadius: '12px',
              fontFamily: 'var(--font-secondary)',
              fontWeight: 'bold',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              fontSize: '0.8rem',
              transition: 'all 0.3s ease',
              '&:hover': {
                boxShadow: '0 0 15px rgba(255, 0, 0, 0.3)',
                transform: 'translateY(-2px)'
              }
            }}
          >
            {uploading ? 'Removing...' : 'Remove Image'}
          </Button>
        </Box>
      )}

      {/* Upload Instructions */}
      <Typography
        variant="caption"
        sx={{
          display: 'block',
          color: 'var(--text-muted)',
          fontFamily: 'var(--font-primary)',
          mt: 1,
          lineHeight: 1.4
        }}
      >
        Supported formats: JPEG, PNG, GIF, WebP
        <br />
        Maximum size: 5MB
      </Typography>
    </Box>
  );
};

export default ProfileImageUpload;
