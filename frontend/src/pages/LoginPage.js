// src/pages/LoginPage.js
import React, { useState, useEffect } from 'react'; // Added useEffect
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Link as MuiLink, // Renamed Link to MuiLink to avoid conflict
  Stack,
  CircularProgress, // For loading state
  Alert // To display errors
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // Import RouterLink
import GoogleIcon from '@mui/icons-material/Google';
import AppleIcon from '@mui/icons-material/Apple';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../contexts/AuthContext'; // Import the useAuth hook

// Placeholder for Slack Logo (keep as is or replace)
const SlackLogo = () => (
    <svg width="48" height="48" viewBox="0 0 102 102" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.44 71.18C22.44 67.94 25.13 65.25 28.37 65.25H39.47V54.15C39.47 50.91 36.78 48.22 33.54 48.22H11.33C8.09 48.22 5.4 50.91 5.4 54.15V71.18C5.4 74.42 8.09 77.11 11.33 77.11H22.44V71.18Z" fill="#ECB22E"/>
      <path d="M30.86 22.44C34.1 22.44 36.79 25.13 36.79 28.37V39.47H47.89C51.13 39.47 53.82 36.78 53.82 33.54V11.33C53.82 8.09 51.13 5.4 47.89 5.4H30.86V22.44Z" fill="#E01E5A"/>
      <path d="M71.18 30.86C74.42 30.86 77.11 33.55 77.11 36.79V47.89H88.21C91.45 47.89 94.14 50.58 94.14 53.82V76.03C94.14 79.27 91.45 81.96 88.21 81.96H71.18V30.86Z" fill="#36C5F0"/>
      <path d="M79.56 79.56C76.32 79.56 73.63 76.87 73.63 73.63V62.53H62.53C59.29 62.53 56.6 65.22 56.6 68.46V90.67C56.6 93.91 59.29 96.6 62.53 96.6H79.56V79.56Z" fill="#2EB67D"/>
    </svg>
);


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();
  const { loginUser, isLoading, error, clearError } = useAuth(); // Get functions and state from context

  // Clear error when component mounts or email/password changes
  useEffect(() => {
      clearError();
  }, [clearError, email, password]);


  const handleLogin = async (event) => {
    event.preventDefault();
    // Call the login function from the AuthContext
    const success = await loginUser(email, password);
    // Navigation is handled by AppRoutes based on isAuthenticated state changes
    // if (success) {
    //   // No need to navigate here anymore
    // }
  };

  const handleGoogleSignIn = () => {
      console.log('Sign in with Google');
      // Implement Google Sign-in logic
  };

  const handleAppleSignIn = () => {
      console.log('Sign in with Apple');
      // Implement Apple Sign-in logic
  };


  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <SlackLogo />
        <Typography component="h1" variant="h5" sx={{ mt: 2, fontWeight: 'bold' }}>
          Sign in to Your Workspace
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          your-workspace.slack.com {/* Replace with dynamic name */}
        </Typography>

        {/* Display Auth Error */}
        {error && (
            <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                {error}
            </Alert>
        )}

        {/* Social Login Buttons */}
        <Stack spacing={1.5} sx={{ width: '100%', mb: 2 }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignIn}
            disabled={isLoading} // Disable during loading
            sx={{ /* styles */ }}
          >
            Sign in with Google
          </Button>
           <Button
            fullWidth
            variant="outlined"
            startIcon={<AppleIcon />}
            onClick={handleAppleSignIn}
            disabled={isLoading} // Disable during loading
            sx={{ /* styles */ }}
          >
            Sign in with Apple
          </Button>
        </Stack>

        {/* OR Divider */}
        <Divider sx={{ width: '100%', my: 2, fontSize: '0.8rem' }}>OR</Divider>

        {/* Email/Password Form */}
        <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            variant="outlined"
            disabled={isLoading} // Disable during loading
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            variant="outlined"
            sx={{ mb: 2 }}
            disabled={isLoading} // Disable during loading
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isLoading} // Disable button while loading
            sx={{
              mt: 1,
              mb: 2,
              py: 1.2,
              fontWeight: 'bold',
              fontSize: '1rem',
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </Button>

          {/* Links */}
          <Stack spacing={0.5} alignItems="center">
            <MuiLink href="#" variant="body2" onClick={(e) => {e.preventDefault(); console.log('Forgot password')}}>
              Forgot your password?
            </MuiLink>
            <MuiLink href="#" variant="body2" onClick={(e) => {e.preventDefault(); console.log('Find workspaces')}}>
              Looking for another workspace? Find your workspaces
            </MuiLink>
            {/* Use RouterLink for internal navigation */}
             <MuiLink component={RouterLink} to="/signup" variant="body2">
                Don't have an account? Sign Up
             </MuiLink>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}