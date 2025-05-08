import React, { useState, useEffect, useRef } from 'react'; // Added useEffect, useRef
import {
  Box,
  Avatar,
  Typography,
  IconButton,
  InputBase,
  Paper,
  Stack,
  Tooltip,
  CircularProgress, // For loading
  Alert // For errors
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useChat } from '../contexts/ChatContext'; // Import the chat hook
import { useAuth } from '../contexts/AuthContext'; // To potentially get user info if needed, though backend handles sender
import * as api from '../services/api'; // Import API functions

export default function ChatWindow() {
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false); // State for send button loading
  const [sendError, setSendError] = useState(null); // State for send errors

  const {
    messages, // This now comes from the context
    selectedChannelId,
    isLoadingMessages,
    error: chatError // Rename context error to avoid conflict
  } = useChat();

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    setSendError(null);
  }, [draft]);

  const handleSendMessage = async () => {
    if (!draft.trim() || !selectedChannelId || sending) return;

    setSending(true);
    setSendError(null);

    try {
      await api.postMessage(selectedChannelId, draft.trim());
      setDraft('');
    } catch (err) {
      console.error("Error sending message:", err);
      setSendError(err.response?.data?.message || "Failed to send message.");
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } catch (e) {
      console.error("Error formatting timestamp:", timestamp, e);
      return 'Invalid Date';
    }
  };

  const getAvatar = (userName) => {
    return <Avatar sx={{ width: 36, height: 36, mr: 1.5 }}>{userName?.[0]?.toUpperCase() || '?'}</Avatar>;
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.paper',
      }}
    >
      <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2 }}>
        {isLoadingMessages && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        )}

        {chatError && !isLoadingMessages && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', p: 2 }}>
            <Alert severity="error">{chatError}</Alert>
          </Box>
        )}

        {!isLoadingMessages && !chatError && messages.length === 0 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color="text.secondary">No messages yet. Start the conversation!</Typography>
          </Box>
        )}

        {!isLoadingMessages && !chatError && messages.length > 0 && messages.map((msg) => (
          <Box key={msg._id} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
            {getAvatar(msg.sender?.username)} {/* Updated to use username */}
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.2 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mr: 0.5 }}>
                  {msg.sender?.username || 'Unknown User'} {/* Updated to display username */}
                </Typography>
                <Typography variant="caption" component="span" color="text.secondary">
                  {formatTimestamp(msg.createdAt || msg.timestamp)}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ lineHeight: 1.45 }}>
                {msg.content}
              </Typography>
            </Box>
          </Box>
        ))}
        <div ref={messagesEndRef} />
      </Box>

      <Box sx={{ p: 2, pt: 1 }}>
        {sendError && (
          <Alert severity="error" sx={{ mb: 1 }} onClose={() => setSendError(null)}>
            {sendError}
          </Alert>
        )}
        <Paper
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: sendError ? 'error.main' : '#bababa',
            borderRadius: '8px',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            '&:focus-within': {
              borderColor: sendError ? 'error.main' : 'primary.main',
              boxShadow: sendError ? '0 0 0 1px #d32f2f' : '0 0 0 1px #511281'
            }
          }}
        >
          <InputBase
            multiline
            fullWidth
            minRows={1}
            maxRows={10}
            placeholder={selectedChannelId ? "Message..." : "Select a channel to send messages"}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            disabled={!selectedChannelId || sending}
            sx={{ p: 1.5, fontSize: '0.95rem', lineHeight: 1.45, flexGrow: 1 }}
          />
        </Paper>
      </Box>
    </Box>
  );
}