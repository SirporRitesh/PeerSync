import React from 'react';
import { Box, CssBaseline } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import ChatWindow from './components/ChatWindow';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { theme } from './theme';
import { AuthProvider, useAuth } from './contexts/AuthContext'; // Import AuthProvider and useAuth
import { ChatProvider } from './contexts/ChatContext'; // Import ChatProvider
import ErrorBoundary from './components/ErrorBoundary'; // Import ErrorBoundary

// A layout component for the main application
function MainAppLayout() {
  return (
    <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar />
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'background.default',
        }}
      >
        <TopBar />
        <ChatWindow />
      </Box>
    </Box>
  );
}

// Component to handle routing logic based on auth state
function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    // Optional: Show a loading spinner/indicator
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={!isAuthenticated ? <LoginPage /> : <Navigate to="/workspace" replace />}
      />
      <Route
        path="/signup"
        element={!isAuthenticated ? <SignupPage /> : <Navigate to="/workspace" replace />}
      />

      {/* Protected routes */}
      <Route
        path="/workspace"
        element={
          isAuthenticated ? <MainAppLayout /> : <Navigate to="/login" replace />
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated ? <MainAppLayout /> : <Navigate to="/login" replace />
        }
      />

      {/* Catch-all or 404 route */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <ErrorBoundary>
          <AuthProvider>
            <ChatProvider>
              <AppRoutes />
            </ChatProvider>
          </AuthProvider>
        </ErrorBoundary>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;