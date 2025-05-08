import { useState, useEffect, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext'; // To potentially pass auth token

// Define the socket connection options
const SOCKET_URL = 'http://localhost:5000'; // Your backend socket URL
const socketOptions = {
    withCredentials: true, // If using cookies/sessions
    transports: ['websocket'], // Explicitly use websockets
};

export const useSocket = () => {
    const { isAuthenticated, token } = useAuth(); // Get auth state and token
    const socketRef = useRef(null); // Use useRef to hold the socket instance
    const [isConnected, setIsConnected] = useState(false);

    // Function to connect the socket
    const connectSocket = useCallback(() => {
        if (!socketRef.current && isAuthenticated && token) { // Only connect if authenticated and not already connected
            console.log('useSocket: Attempting to connect with token...');

            // Update options with the current token for authentication
            const options = {
                ...socketOptions,
                auth: { token }, // Ensure the token is sent during connection
            };

            socketRef.current = io(SOCKET_URL, options);

            socketRef.current.on('connect', () => {
                console.log('useSocket: Connected successfully! Socket ID:', socketRef.current.id);
                setIsConnected(true);
            });

            socketRef.current.on('disconnect', (reason) => {
                console.log('useSocket: Disconnected. Reason:', reason);
                setIsConnected(false);
                if (reason === 'io server disconnect') {
                    // Handle forced disconnect from server
                }
                socketRef.current = null; // Clear ref on disconnect
            });

            socketRef.current.on('connect_error', (err) => {
                console.error('useSocket: Connection Error:', err.message);
                setIsConnected(false);
                socketRef.current = null; // Clear ref on error
            });

            socketRef.current.on('error', (error) => {
                console.error('useSocket: General Socket Error:', error);
            });
        } else if (socketRef.current && (!isAuthenticated || !token)) {
            // Disconnect if user logs out while connected
            console.log('useSocket: User logged out, disconnecting socket...');
            socketRef.current.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        }
    }, [isAuthenticated, token]); // Depend on auth state

    // Effect to manage connection based on authentication status
    useEffect(() => {
        connectSocket(); // Attempt connection when component mounts or auth changes

        // Cleanup function to disconnect on component unmount
        return () => {
            if (socketRef.current) {
                console.log('useSocket: Cleaning up socket connection.');
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
    }, [connectSocket]); // Depend on the memoized connect function

    // Function to emit events
    const emit = useCallback((eventName, data) => {
        if (socketRef.current && isConnected) {
            socketRef.current.emit(eventName, data);
        } else {
            console.warn(`useSocket: Cannot emit "${eventName}". Socket not connected.`);
        }
    }, [isConnected]); // Depend on connection status

    // Function to register event listeners
    const on = useCallback((eventName, callback) => {
        if (socketRef.current) {
            socketRef.current.on(eventName, callback);
            return () => {
                if (socketRef.current) {
                    socketRef.current.off(eventName, callback);
                }
            };
        } else {
            console.warn(`useSocket: Cannot register listener for "${eventName}". Socket not initialized.`);
            return () => {};
        }
    }, []); // Socket ref doesn't change unless remounting

    return { socket: socketRef.current, emit, on, isConnected };
};