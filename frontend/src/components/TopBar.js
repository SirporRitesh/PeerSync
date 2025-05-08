//frontend/src/components/Topbar.js
import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  IconButton,
  Button, // Use button for clickable text
  AvatarGroup // Import AvatarGroup
} from '@mui/material';
import HeadsetIcon from '@mui/icons-material/Headset'; // Huddle/Call icon
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // Details icon
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'; // Dropdown arrow

export default function TopBar() {
  // Dummy participant data
  const participants = [
    { alt: 'Ritesh Sirpor', src: '/path/to/lisa.jpg' },
    { alt: 'Arcadio Buendía', src: '/path/to/arcadio.jpg' },
    { alt: 'Matt Brewer', src: '/path/to/matt.jpg' },
    { alt: 'Extra User 1', src: '/path/to/extra1.jpg' },
  ];

  return (
    <AppBar
      position="static"
      sx={{
        bgcolor: 'background.paper', // Use theme background
        color: 'text.primary', // Use theme text color
        boxShadow: 'none',
        borderBottom: '1px solid', // Add border
        borderColor: 'divider', // Use theme divider color
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', minHeight: '50px !important' }}> {/* Adjust height */}
        {/* Left Side: Channel Name and Pinned Items */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="text"
            color="inherit"
            endIcon={<KeyboardArrowDownIcon />}
            sx={{ textTransform: 'none', fontWeight: 'bold', fontSize: '1.05rem', p:0, '&:hover': {bgcolor: 'transparent'} }}
          >
            # general
          </Button>
          {/* Placeholder for Pinned/Resources - Style as needed */}
          <Typography variant="body2" color="text.secondary">
            3 Pinned
          </Typography>
           <Typography variant="body2" color="text.secondary">
            Resources
          </Typography>
        </Box>

        {/* Right Side: Participants and Actions */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {/* Avatar Group */}
          <AvatarGroup max={4} sx={{ '& .MuiAvatar-root': { width: 28, height: 28, fontSize: '0.75rem', marginLeft: '-8px' } }}>
            {participants.map((p, i) => (
              <Avatar key={i} alt={p.alt} src={p.src}>{!p.src ? p.alt[0] : null}</Avatar>
            ))}
          </AvatarGroup>
          {/* Participant Count */}
           <Typography variant="body2" sx={{mr: 1}}>17</Typography>

          {/* Action Icons */}
          <IconButton size="small"><HeadsetIcon /></IconButton>
          <IconButton size="small"><InfoOutlinedIcon /></IconButton> {/* Details Icon */}
        </Box>
      </Toolbar>
    </AppBar>
  );
}