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
} from '@mui/material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function SignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent duplicate submissions
  const { signupUser, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError, firstName, lastName, username, email, password, confirmPassword, workspaceName]);

  const handleSignup = async (event) => {
    event.preventDefault();

    if (isSubmitting) return; // Prevent duplicate submissions
    setIsSubmitting(true);

    try {
      // Validate required fields
      if (!firstName || !lastName || !username || !email || !password || !workspaceName) {
        alert('All fields are required!');
        return;
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address');
        return;
      }

      if (password !== confirmPassword) {
        alert('Passwords do not match!');
        return;
      }

      const payload = { firstName, lastName, username, email, password, workspaceName };
      console.log('Signup Payload:', payload);

      const success = await signupUser(payload);
      if (success) {
        navigate('/login');
      }
    } finally {
      setIsSubmitting(false); // Reset submitting state
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

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error}
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