import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  LinearProgress,
} from "@mui/material";
import {
  CloudUpload as UploadIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import chatService from "../../services/chat";

const FileUpload = ({ open, onClose, onFileSelect }) => {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (file) => {
    if (file.size > 10 * 1024 * 1024) {
      alert("File size cannot exceed 10MB");
      return;
    }
    setSelectedFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    try {
      await onFileSelect(selectedFile);
      handleClose();
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setUploading(false);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          bgcolor: "GrayText",
        }}
      >
        Upload File
        <IconButton onClick={handleClose}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Box
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          sx={{
            border: 2,
            borderColor: dragOver ? "primary.main" : "grey.300",
            borderStyle: "dashed",
            borderRadius: 2,
            p: 4,
            textAlign: "center",
            bgcolor: dragOver ? "primary.light" : "background.paper",
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onClick={() => {
            const input = document.createElement("input");
            input.type = "file";
            input.onchange = (e) => {
              if (e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            };
            input.click();
          }}
        >
          <UploadIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {selectedFile ? selectedFile.name : "Choose a file or drag it here"}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Maximum file size: 10MB
          </Typography>
          {selectedFile && (
            <Typography variant="body2" color="primary" sx={{ mt: 1 }}>
              Size: {chatService.formatFileSize(selectedFile.size)}
            </Typography>
          )}
        </Box>

        {uploading && (
          <Box sx={{ mt: 2 }}>
            <LinearProgress />
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Uploading file...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleUpload}
          variant="contained"
          disabled={!selectedFile || uploading}
        >
          Upload
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FileUpload;
