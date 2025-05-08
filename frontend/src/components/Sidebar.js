import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  CircularProgress,
  Button,
  Collapse,
  Divider,
  Tooltip,
  IconButton,
} from '@mui/material';
import BusinessIcon from '@mui/icons-material/Business';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PersonAddAlt1Icon from '@mui/icons-material/PersonAddAlt1';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../contexts/AuthContext';
import { useChat } from '../contexts/ChatContext';

export default function Sidebar() {
  const [channelsOpen, setChannelsOpen] = useState(true);
  const [membersOpen, setMembersOpen] = useState(true);
  const [dmsOpen, setDmsOpen] = useState(true); // State for DMs collapse

  const toggleChannelsOpen = () => {
    setChannelsOpen((prev) => !prev);
  };

  const { user, logoutUser } = useAuth();
  const {
    workspaces,
    selectedWorkspace,
    channels,
    selectedChannelId,
    isLoadingWorkspaces,
    isLoadingChannels,
    selectWorkspace,
    selectChannel,
    onlineUserIds,
  } = useChat();

  const handleLogout = () => {
    logoutUser();
  };

  return (
    <Box
      sx={{
        width: 280,
        backgroundColor: 'primary.main',
        color: 'text.slack',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
      }}
    >
      <Box
        sx={{
          p: 1.5,
          pb: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Typography
            variant="h6"
            sx={{ color: 'common.white', display: 'flex', alignItems: 'center' }}
          >
            {isLoadingWorkspaces
              ? 'Loading...'
              : selectedWorkspace?.name || 'PeerSync'}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                backgroundColor: '#38978d',
                borderRadius: '50%',
                mr: 0.7,
                border: '1px solid #511281',
              }}
            />
            <Typography
              variant="caption"
              sx={{ color: 'text.slack', opacity: 0.9 }}
            >
              {user?.username || user?.firstName || 'User'}
            </Typography>
            <Button
              size="small"
              variant="text"
              onClick={handleLogout}
              sx={{
                color: 'text.slack',
                ml: 'auto',
                textTransform: 'none',
                fontSize: '0.75rem',
              }}
            >
              Logout
            </Button>
          </Box>
        </Box>
        {selectedWorkspace && (
          <Tooltip title="Invite User">
            <IconButton
              size="small"
              onClick={() => console.log(`Invite users to ${selectedWorkspace.name}`)}
              sx={{ 
                color: 'text.slack', 
                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }, 
                ml: 1 
              }}
            >
              <PersonAddAlt1Icon sx={{ fontSize: '1.1rem' }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Box sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden', p: 1 }}>
        <Typography
          variant="caption"
          sx={{
            pl: 1,
            fontWeight: 'bold',
            color: 'text.slackHeader',
            textTransform: 'uppercase',
            display: 'block',
            mb: 0.5,
          }}
        >
          Workspaces
        </Typography>
        {isLoadingWorkspaces ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
            <CircularProgress size={20} color="inherit" />
          </Box>
        ) : (
          <List dense>
            {(!Array.isArray(workspaces) || workspaces.length === 0) && (
              <ListItemText
                primary="No workspaces found."
                sx={{ pl: 1 }}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            )}
            {Array.isArray(workspaces) &&
              workspaces.map((ws) => (
                <ListItemButton
                  key={ws._id}
                  selected={selectedWorkspace?._id === ws._id}
                  onClick={() => selectWorkspace(ws._id)}
                >
                  <ListItemIcon>
                    <BusinessIcon sx={{ fontSize: '1.1rem' }} />
                  </ListItemIcon>
                  <ListItemText
                    primary={ws.name}
                    primaryTypographyProps={{
                      variant: 'body2',
                      fontWeight:
                        selectedWorkspace?._id === ws._id ? 'bold' : 'normal',
                    }}
                  />
                </ListItemButton>
              ))}
          </List>
        )}

        {/* Channels Section */}
        {selectedWorkspace && (
          <>
            <ListItemButton 
              onClick={toggleChannelsOpen} 
              sx={{ 
                '&:hover': { bgcolor: 'transparent' },
                pl: 1,
                pr: 0.5
              }}
            >
              <ListItemIcon sx={{ minWidth: '20px' }}>
                {channelsOpen ? (
                  <ExpandMore sx={{ fontSize: '1rem' }} />
                ) : (
                  <ChevronRightIcon sx={{ fontSize: '1rem' }} />
                )}
              </ListItemIcon>
              <ListItemText
                primary="Channels"
                primaryTypographyProps={{
                  variant: 'caption',
                  fontWeight: 'bold',
                  color: 'text.slackHeader',
                  textTransform: 'uppercase',
                }}
              />
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  console.log('Add new channel clicked');
                }}
                sx={{ 
                  color: 'text.slackHeader', 
                  '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                }}
              >
                <AddIcon sx={{ fontSize: '1rem' }} />
              </IconButton>
            </ListItemButton>
            <Collapse in={channelsOpen} timeout="auto" unmountOnExit>
              {isLoadingChannels ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 1 }}>
                  <CircularProgress size={20} color="inherit" />
                </Box>
              ) : (
                <List component="div" disablePadding dense>
                  {channels.length === 0 && (
                    <ListItemText
                      primary="No channels yet."
                      sx={{ pl: 3 }}
                      primaryTypographyProps={{ variant: 'body2' }}
                    />
                  )}
                  {Array.isArray(channels) &&
                    channels.map((ch) => (
                      <ListItemButton
                        key={ch._id}
                        selected={selectedChannelId === ch._id}
                        onClick={() => selectChannel(ch._id)}
                        sx={{ pl: 3 }}
                      >
                        <ListItemText primary={ch.name} />
                      </ListItemButton>
                    ))}
                </List>
              )}
            </Collapse>
          </>
        )}

        {/* Direct Messages Section */}
        {selectedWorkspace && (
          <>
            <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', my: 1 }} />
            <List dense>
              <ListItemButton 
                onClick={() => setDmsOpen(!dmsOpen)} 
                sx={{ '&:hover': { bgcolor: 'transparent' }}}
              >
                <ListItemIcon sx={{ minWidth: '20px' }}>
                  {dmsOpen ? (
                    <ExpandMore sx={{ fontSize: '1rem' }} />
                  ) : (
                    <ChevronRightIcon sx={{ fontSize: '1rem' }} />
                  )}
                </ListItemIcon>
                <ListItemText 
                  primary="Direct Messages" 
                  primaryTypographyProps={{ 
                    variant: 'caption', 
                    fontWeight: 'bold', 
                    color: 'text.slackHeader', 
                    textTransform: 'uppercase' 
                  }}
                />
              </ListItemButton>
              <Collapse in={dmsOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding dense>
                  <ListItemText 
                    primary="No direct messages yet." 
                    sx={{ pl: 3, pt: 0.5, pb: 0.5 }} 
                    primaryTypographyProps={{ 
                      variant: 'body2', 
                      fontStyle: 'italic', 
                      color: 'text.slack' 
                    }}
                  />
                </List>
              </Collapse>
            </List>
          </>
        )}

        {/* Members Section */}
        {selectedWorkspace && selectedWorkspace.members && (
          <>
            <Divider sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)', my: 1 }} />
            <List dense>
              <ListItemButton
                onClick={() => setMembersOpen(!membersOpen)}
                sx={{ '&:hover': { bgcolor: 'transparent' } }}
              >
                <ListItemIcon sx={{ minWidth: '20px' }}>
                  {membersOpen ? (
                    <ExpandMore sx={{ fontSize: '1rem' }} />
                  ) : (
                    <ChevronRightIcon sx={{ fontSize: '1rem' }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary="Members"
                  primaryTypographyProps={{
                    variant: 'caption',
                    fontWeight: 'bold',
                    color: 'text.slackHeader',
                    textTransform: 'uppercase',
                  }}
                />
              </ListItemButton>
              <Collapse in={membersOpen} timeout="auto" unmountOnExit>
                <List component="div" disablePadding dense>
                  {selectedWorkspace.members.map((member) => {
                    const isOnline = onlineUserIds.has(member.userId._id);
                    return (
                      <ListItemButton key={member.userId._id} sx={{ pl: 3 }}>
                        <ListItemIcon>
                          <Box
                            sx={{
                              width: 8,
                              height: 8,
                              bgcolor: isOnline ? 'success.main' : 'grey.500',
                              borderRadius: '50%',
                              mr: 1,
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={member.userId.username || member.userId.email}
                          primaryTypographyProps={{ variant: 'body2' }}
                        />
                      </ListItemButton>
                    );
                  })}
                </List>
              </Collapse>
            </List>
          </>
        )}
      </Box>
    </Box>
  );
}