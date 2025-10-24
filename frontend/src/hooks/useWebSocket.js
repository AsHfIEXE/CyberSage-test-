import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

/**
 * Dynamic WebSocket Hook for CyberSage v2.0
 * Works with: localhost, SSH tunnels, Netbird VPN, homelab, any network
 * Auto-discovers backend regardless of network topology
 */
export const useWebSocket = () => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);
  const [backendUrl, setBackendUrl] = useState(null);

  useEffect(() => {
    // Dynamic backend URL detection - works ANYWHERE
    const detectBackendUrl = async () => {
      const possibleUrls = [];

      // Priority 1: Environment variable (manual override)
      if (process.env.REACT_APP_BACKEND_URL) {
        possibleUrls.push(process.env.REACT_APP_BACKEND_URL);
      }

      // Priority 2: Same host as frontend (most common case)
      // Works for: SSH tunnels, Netbird, same machine, etc.
      const currentHost = window.location.hostname;
      const currentProtocol = window.location.protocol;
      possibleUrls.push(`${currentProtocol}//${currentHost}:5000`);

      // Priority 3: Localhost variations (development)
      possibleUrls.push('http://localhost:5000');
      possibleUrls.push('http://127.0.0.1:5000');

      // Priority 4: WebSocket-specific URLs (some proxies need ws://)
      possibleUrls.push(`ws://${currentHost}:5000`);
      possibleUrls.push(`wss://${currentHost}:5000`);

      console.log('[WebSocket] Testing backend URLs:', possibleUrls);

      // Test each URL to find working backend
      for (const url of possibleUrls) {
        try {
          // Normalize URL (remove ws:// prefix for fetch)
          const testUrl = url.replace(/^wss?:\/\//, 'http://');
          
          console.log(`[WebSocket] Testing: ${testUrl}/api/health`);
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 3000); // 3s timeout

          const response = await fetch(`${testUrl}/api/health`, {
            signal: controller.signal,
            mode: 'cors',
            headers: {
              'Accept': 'application/json'
            }
          });

          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            if (data.status === 'healthy') {
              // Found working backend!
              const finalUrl = testUrl;
              console.log(`✅ [WebSocket] Backend discovered at: ${finalUrl}`);
              console.log(`✅ [WebSocket] Backend info:`, data);
              return finalUrl;
            }
          }
        } catch (error) {
          // Silently continue to next URL
          // Only log if it's not a timeout/network error
          if (error.name !== 'AbortError') {
            console.debug(`[WebSocket] ${url} - ${error.message}`);
          }
        }
      }

      // Fallback: use same host (will fail gracefully if backend not running)
      const fallback = `${window.location.protocol}//${window.location.hostname}:5000`;
      console.warn(`⚠️ [WebSocket] No backend found, using fallback: ${fallback}`);
      console.warn(`⚠️ [WebSocket] Make sure backend is running on port 5000`);
      return fallback;
    };

    // Initialize connection
    const initializeSocket = async () => {
      const discoveredUrl = await detectBackendUrl();
      setBackendUrl(discoveredUrl);
      
      console.log('[WebSocket] Initializing connection to:', discoveredUrl);

      // Create socket connection with smart configuration
      const newSocket = io(`${discoveredUrl}/scan`, {
        transports: ['polling', 'websocket'], // Try polling first, upgrade to websocket
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10,
        timeout: 20000,
        upgrade: true,
        forceNew: false,  // Reuse existing connection if available
        autoConnect: true,
        withCredentials: false,
        path: '/socket.io',
        // Force Socket.IO v4 protocol (EIO=4)
        query: {
          EIO: '4',
          transport: 'polling'
        }
      });

      // Connection event handlers
      newSocket.on('connect', () => {
        console.log('✅ [WebSocket] Connected successfully!');
        console.log('   Socket ID:', newSocket.id);
        console.log('   Backend URL:', discoveredUrl);
        console.log('   Transport:', newSocket.io.engine.transport.name);
        console.log('   Protocol:', 'EIO=4 (Socket.IO v4)');
        setConnected(true);
        setReconnecting(false);
      });

      newSocket.on('disconnect', (reason) => {
        console.log('❌ [WebSocket] Disconnected');
        console.log('   Reason:', reason);
        setConnected(false);
        
        if (reason === 'io server disconnect') {
          // Server disconnected, manually reconnect
          console.log('🔄 [WebSocket] Server disconnected, reconnecting...');
          setTimeout(() => newSocket.connect(), 1000);
        }
      });

      newSocket.on('connect_error', (error) => {
        console.error('❌ [WebSocket] Connection error');
        console.error('   Error:', error.message);
        console.error('   Type:', error.type);
        console.error('   Description:', error.description);
        console.error('   Backend URL:', discoveredUrl);
        
        // Check if it's a protocol mismatch
        if (error.message.includes('unsupported version')) {
          console.error('   ⚠️ Protocol mismatch detected!');
          console.error('   Frontend expects: Socket.IO v4 (EIO=4)');
          console.error('   Backend might be using different version');
        }
        
        setConnected(false);
        setReconnecting(true);
      });

      newSocket.on('reconnect_attempt', (attemptNumber) => {
        console.log(`🔄 [WebSocket] Reconnection attempt ${attemptNumber}...`);
        setReconnecting(true);
      });

      newSocket.on('reconnect', (attemptNumber) => {
        console.log(`✅ [WebSocket] Reconnected after ${attemptNumber} attempts`);
        setConnected(true);
        setReconnecting(false);
      });

      newSocket.on('reconnect_failed', () => {
        console.error('❌ [WebSocket] Reconnection failed after all attempts');
        console.error('   Check if backend is running on:', discoveredUrl);
        setConnected(false);
        setReconnecting(false);
      });

      newSocket.on('error', (error) => {
        console.error('❌ [WebSocket] Socket error:', error);
      });

      // Handle ping/pong for connection health
      newSocket.on('pong', () => {
        console.log('🏓 [WebSocket] Pong received - Connection healthy');
      });

      // Backend-specific events
      newSocket.on('connected', (data) => {
        console.log('🎉 [Backend] Connected event received');
        console.log('   Status:', data.status);
        console.log('   Message:', data.message);
        console.log('   Version:', data.version);
      });

      setSocket(newSocket);

      // Cleanup on unmount
      return () => {
        console.log('[WebSocket] Cleaning up connection');
        newSocket.close();
      };
    };

    initializeSocket();
  }, []);

  // Helper: Check connection health
  const checkConnection = () => {
    if (socket && socket.connected) {
      socket.emit('ping');
      return true;
    }
    return false;
  };

  // Helper: Manual reconnect
  const reconnect = () => {
    if (socket) {
      console.log('[WebSocket] Manual reconnection triggered');
      socket.connect();
    }
  };

  // Helper: Get current backend URL
  const getBackendUrl = () => {
    return backendUrl;
  };

  // Helper: Get connection info for debugging
  const getConnectionInfo = () => {
    if (!socket) return null;
    
    return {
      connected: socket.connected,
      id: socket.id,
      backendUrl: backendUrl,
      transport: socket.io?.engine?.transport?.name,
      protocol: 'EIO=4 (Socket.IO v4)'
    };
  };

  return { 
    socket, 
    connected, 
    reconnecting,
    checkConnection,
    reconnect,
    backendUrl: getBackendUrl(),
    connectionInfo: getConnectionInfo()
  };
};