import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  Stack,
  CircularProgress,
  Alert,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  FormControl,
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [signupAction, setSignupAction] = useState('create');
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent duplicate submissions
  const [localError, setLocalError] = useState(null);
  const { signupUser, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
    setLocalError(null);
  }, [clearError, firstName, lastName, username, email, password, confirmPassword, workspaceName, inviteCode, signupAction]);

  const handleSignup = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      
      // Basic validation
      if (!firstName?.trim() || !lastName?.trim() || !username?.trim() || 
          !email?.trim() || !password?.trim()) {
        setLocalError('All fields are required');
        return;
      }

      // Advanced email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const emailValue = email.trim().toLowerCase();
      if (!emailRegex.test(emailValue)) {
        setLocalError('Please enter a valid email address');
        return;
      }

      // Password strength validation
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters');
        return;
      }

      // Password match validation
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match');
        return;
      }

      // Base user data with sanitized inputs
      const userData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim().toLowerCase(),
        email: emailValue,
        password,
        action: signupAction // Include the action type
      };

      // Add workspace-specific data
      if (signupAction === 'create') {
        if (!workspaceName?.trim()) {
          setLocalError('Workspace name is required when creating a new workspace');
          return;
        }
        userData.workspaceName = workspaceName.trim();
      } else if (signupAction === 'join') {
        if (!inviteCode?.trim()) {
          setLocalError('Invite code is required when joining a workspace');
          return;
        }
        userData.inviteCode = inviteCode.trim().toUpperCase();
      }

      console.log('Initiating signup with:', {
        ...userData,
        password: '[REDACTED]'
      });
      
      const result = await signupUser(userData);
      if (result.success) {
        if (result.workspaceId) {
          navigate(`/workspace/${result.workspaceId}`);
        } else {
          navigate('/login');
        }
      }
    } catch (error) {
      console.error('Signup submission error:', error);
      setLocalError(error.response?.data?.message || 'An error occurred during signup');
    } finally {
      setIsSubmitting(false);
    }
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
        <Typography component="h1" variant="h5" sx={{ mt: 2, mb: 2, fontWeight: 'bold' }}>
          Create Account
        </Typography>

        {(localError || error) && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {localError || error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSignup} noValidate sx={{ mt: 1, width: '100%' }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="firstName"
            label="First Name"
            name="firstName"
            autoComplete="given-name"
            autoFocus
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            disabled={isLoading || isSubmitting}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="lastName"
            label="Last Name"
            name="lastName"
            autoComplete="family-name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            disabled={isLoading || isSubmitting}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            disabled={isLoading || isSubmitting}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email-signup"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value.trim())} // Trim input value
            disabled={isLoading || isSubmitting}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password-signup"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading || isSubmitting}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isLoading || isSubmitting}
          />

          <FormControl component="fieldset" sx={{ mt: 2, mb: 1, width: '100%' }}>
            <FormLabel component="legend">Workspace Action</FormLabel>
            <RadioGroup
              row
              aria-label="workspace-action"
              name="workspace-action-group"
              value={signupAction}
              onChange={(e) => setSignupAction(e.target.value)}
            >
              <FormControlLabel value="create" control={<Radio />} label="Create Workspace" />
              <FormControlLabel value="join" control={<Radio />} label="Join Workspace" />
            </RadioGroup>
          </FormControl>

          {signupAction === 'create' && (
            <TextField
              margin="normal"
              required
              fullWidth
              name="workspaceName"
              label="Enter Workspace Name"
              id="workspaceName"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              disabled={isLoading || isSubmitting}
              sx={{ mb: 2 }}
            />
          )}

          {signupAction === 'join' && (
            <TextField
              margin="normal"
              required
              fullWidth
              name="inviteCode"
              label="Enter Invite Code"
              id="inviteCode"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value)}
              disabled={isLoading || isSubmitting}
              sx={{ mb: 2 }}
              helperText="Case-insensitive, e.g., LIX8X9OV"
            />
          )}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            disabled={isLoading || isSubmitting}
            sx={{
              mt: 1,
              mb: 2,
              py: 1.2,
              fontWeight: 'bold',
              fontSize: '1rem',
            }}
          >
            {isLoading || isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
          </Button>

          <Stack spacing={0.5} alignItems="center">
            <MuiLink component={RouterLink} to="/login" variant="body2">
              Already have an account? Sign in
            </MuiLink>
          </Stack>
        </Box>
      </Box>
    </Container>
  );
}