import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { useAuth } from './AuthContext';
import * as api from '../services/api';
import { useSocket } from '../hooks/useSocket';

const ChatContext = createContext(null);

export const ChatProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const { socket, on, emit, isConnected } = useSocket();

  const [workspaces, setWorkspaces] = useState([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState(null);
  const [channels, setChannels] = useState([]);
  const [selectedChannelId, setSelectedChannelId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const [isLoadingChannels, setIsLoadingChannels] = useState(false);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState(null);
  const [onlineUserIds, setOnlineUserIds] = useState(new Set()); // Store online user IDs

  // Function to select a channel
  const selectChannel = useCallback((channelId) => {
    setSelectedChannelId(channelId);
  }, []);

  // Function to select a workspace
  const selectWorkspace = useCallback(async (workspaceId) => {
    if (!workspaceId) return;
    setIsLoadingChannels(true);
    try {
      const workspaceDetails = await api.fetchWorkspaceDetails(workspaceId);

      console.log("[ChatContext selectWorkspace] Fetched workspace details:", workspaceDetails);

      const channelsFromApi = workspaceDetails?.channels || [];
      console.log("[ChatContext selectWorkspace] Extracted channels:", channelsFromApi);

      setChannels(channelsFromApi);
      setSelectedWorkspace(workspaceDetails);

      if (channelsFromApi.length > 0) {
        selectChannel(channelsFromApi[0]._id);
      } else {
        setSelectedChannelId(null);
      }
    } catch (err) {
      console.error("Error selecting workspace:", err);
      setError("Failed to load workspace details");
    } finally {
      setIsLoadingChannels(false);
    }
  }, [selectChannel]);

  // --- Actions ---
  const addMessage = useCallback((newMessage) => {
    if (newMessage && newMessage.channel === selectedChannelId) {
      setMessages((prevMessages) => {
        const exists = prevMessages.some(msg => msg._id === newMessage._id);
        if (exists) return prevMessages;
        return [...prevMessages, newMessage];
      });
    }
  }, [selectedChannelId]);

  // --- Socket Listener Effect ---
  useEffect(() => {
    if (socket && isConnected) {
      console.log("ChatContext: Setting up socket listeners.");

      const unregisterMessageListener = on('message', (newMessage) => {
        console.log("[Socket Receive] Received 'message' event:", newMessage);
        addMessage(newMessage);
      });

      const unregisterOnlineUsers = on('onlineUsersUpdate', (userIdsArray) => {
        console.log("ChatContext: Received onlineUsersUpdate", userIdsArray);
        setOnlineUserIds(new Set(userIdsArray));
      });

      return () => {
        console.log("ChatContext: Cleaning up socket listeners.");
        unregisterMessageListener();
        unregisterOnlineUsers();
      };
    }
  }, [socket, isConnected, addMessage, on]);

  // --- Socket Join Channel Effect ---
  useEffect(() => {
    if (selectedChannelId && isConnected && emit) {
      emit('joinChannel', selectedChannelId);
    }
  }, [selectedChannelId, isConnected, emit]);

  // --- Data Fetching Effects ---
  useEffect(() => {
    if (isAuthenticated) {
      setIsLoadingWorkspaces(true);
      api.fetchWorkspaces()
        .then(data => {
          setWorkspaces(data || []);
          if (data && data.length > 0) {
            selectWorkspace(data[0]._id);
          }
        })
        .catch(() => setError("Failed to load workspaces"))
        .finally(() => setIsLoadingWorkspaces(false));
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedChannelId) {
      setIsLoadingMessages(true);
      setError(null);

      api.fetchMessagesForChannel(selectedChannelId)
        .then(data => {
          const messagesToSet = Array.isArray(data) ? data : [];
          setMessages(messagesToSet);
        })
        .catch(err => {
          console.error(`ChatContext: Error fetching messages for channel ${selectedChannelId}:`, err);
          setError("Failed to load messages for the channel.");
          setMessages([]);
        })
        .finally(() => {
          setIsLoadingMessages(false);
        });
    } else {
      setMessages([]);
    }
  }, [selectedChannelId]);

  const value = {
    workspaces,
    selectedWorkspace,
    channels,
    selectedChannelId,
    messages,
    isLoadingWorkspaces,
    isLoadingChannels,
    isLoadingMessages,
    error,
    selectWorkspace,
    selectChannel,
    isSocketConnected: isConnected,
    onlineUserIds, // Expose online user IDs
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};