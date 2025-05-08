import { createTheme } from '@mui/material/styles';

const slackPurple = '#511281'; // Primary Slack purple
const slackPurpleDark = '#3f0f5f'; // Darker shade for hover/selection
const slackText = '#d1d2d3'; // Light text color for sidebar
const slackTextHeader = '#ffffff99'; // Slightly transparent white for headers
const slackActiveItemBackground = '#613b70'; // Background for selected item
const slackHoverItemBackground = '#411a56'; // Background for hovered item
const slackBadgeColor = '#db6668'; // Badge background color

export const theme = createTheme({
  palette: {
    primary: {
      main: slackPurple,
    },
    secondary: {
      main: slackBadgeColor, // Use for badges
    },
    background: {
      default: '#fff', // Main background
      paper: '#fff',   // Component background
    },
    text: {
      primary: '#1d1c1d', // Main text color (mostly black)
      secondary: '#616061', // Lighter text color (timestamps, etc.)
      // Custom colors for sidebar
      slack: slackText,
      slackHeader: slackTextHeader,
      slackActive: '#ffffff',
    },
    divider: '#e8e8e8', // Light divider color
  },
  typography: {
    fontFamily: '"Lato", "Helvetica", "Arial", sans-serif', // Slack-like font
    h6: {
      fontSize: '1.1rem',
      fontWeight: 700,
    },
    subtitle1: {
      fontSize: '0.95rem',
      fontWeight: 600,
    },
    subtitle2: {
      fontSize: '0.9rem', // Slightly smaller for list items
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '0.95rem',
    },
    body2: {
      fontSize: '0.9rem', // Use for chat message text
    },
    caption: {
      fontSize: '0.75rem', // For timestamps
      color: '#616061', // Default timestamp color
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          // Improve scrollbar styling slightly (optional)
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            // backgroundColor: 'rgba(0,0,0,0.1)',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#c1c1c1',
            borderRadius: '4px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: '#a8a8a8',
          },
        },
      },
    },
    MuiList: {
      styleOverrides: {
        root: {
          paddingTop: '4px',
          paddingBottom: '4px',
        },
        dense: {
          paddingTop: '4px',
          paddingBottom: '4px',
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        dense: {
          paddingTop: '2px',
          paddingBottom: '2px',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: '4px',
          paddingTop: '2px',
          paddingBottom: '2px',
          paddingLeft: '8px', // Adjust padding
          paddingRight: '8px',
          color: slackText, // Use custom text color
          '&:hover': {
            backgroundColor: slackHoverItemBackground,
          },
          '&.Mui-selected': {
            backgroundColor: slackActiveItemBackground,
            color: 'text.slackActive', // White text when selected
            '&:hover': {
              backgroundColor: slackActiveItemBackground, // Keep selection color on hover
            },
            // Style icon color when selected
            '.MuiListItemIcon-root': {
                color: 'text.slackActive',
            }
          },
        },
      },
    },
    MuiListItemIcon: {
        styleOverrides: {
            root: {
                minWidth: '30px', // Adjust icon spacing
                color: slackText, // Default icon color in sidebar
            }
        }
    },
    MuiBadge: {
      styleOverrides: {
        badge: {
          // Adjust badge position slightly if needed
          // Example: right: -3, top: 8,
          backgroundColor: slackBadgeColor,
          color: '#fff', // White text on badge
          height: '18px',
          minWidth: '18px',
          fontSize: '0.7rem',
          fontWeight: 'bold',
          padding: '0 5px', // Add some horizontal padding
        },
        dot: {
          height: 10,
          minWidth: 10,
          borderRadius: '50%',
          border: '2px solid #511281', // Match sidebar background
          backgroundColor: '#38978d' // Slack's online green
        }
      }
    },
    MuiAvatar: {
        styleOverrides: {
            root: {
                width: 32, // Default avatar size
                height: 32,
                fontSize: '0.85rem' // Adjust font size for initials
            }
        }
    },
    // Style the chat input specifically
    MuiOutlinedInput: {
        styleOverrides: {
            root: {
                borderRadius: '8px', // Rounded corners like Slack
                // Specific styling for the chat input wrapper if needed later
                // '&.chat-input-wrapper': { ... }
            },
             notchedOutline: {
               // border: '1px solid red' // Example to customize border
             }
        }
    },
    MuiInputBase: {
        styleOverrides: {
            root: {
                fontSize: '0.95rem' // Font size for input fields
            }
        }
    }
    
  },
});
const additionaltheme = createTheme({
  // ... (palette, typography)
  components: {
    // ... (MuiCssBaseline, MuiList, etc.)

    // Customize Link default color if needed
    MuiLink: {
        styleOverrides: {
            root: {
                // color: '#1264a3', // Slack's typical link blue
                // Or keep it primary purple:
                 color: slackPurple,
                textDecoration: 'none', // Remove underline by default
                 '&:hover': {
                    textDecoration: 'underline', // Add underline on hover
                 }
            }
        }
    },
     MuiButton: {
        styleOverrides: {
            // Ensure outlined buttons have appropriate border color
            outlined: ({ additionaltheme }) => ({
                borderColor: theme.palette.divider, // Use divider color for consistency
            }),
             // Example: Style contained primary button text color (already white by default usually)
             // containedPrimary: {
             //    color: '#fff',
             // },
        }
     }
    // ... (other components)
  },
});
