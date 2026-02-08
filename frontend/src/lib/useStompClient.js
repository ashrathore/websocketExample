import { useEffect, useRef, useCallback, useState } from 'react';
import { createStompClient } from './stompClient.js';

/**
 * React hook to use the STOMP web client. Connects on mount, disconnects on unmount.
 * Reusable in any component that needs live data over WebSocket.
 *
 * @param {Object} [options]
 * @param {string} [options.brokerURL] - WebSocket URL (default: ws://localhost:8080/ws)
 * @returns {{ subscribe: (destination, callback) => { unsubscribe }, connected: boolean, error: string | null }}
 */
export function useStompClient(options = {}) {
  const clientRef = useRef(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const client = createStompClient({
      ...options,
      onConnect: () => {
        setConnected(true);
        setError(null);
        options.onConnect?.();
      },
      onError: (err) => {
        setError(err ?? 'Connection error');
        options.onError?.(err);
      },
      onDisconnect: () => {
        setConnected(false);
        options.onDisconnect?.();
      },
    });
    clientRef.current = client;
    client.connect();

    return () => {
      client.disconnect();
      clientRef.current = null;
    };
  }, [options.brokerURL]); // eslint-disable-line react-hooks/exhaustive-deps

  const subscribe = useCallback((destination, callback) => {
    if (!clientRef.current) return { unsubscribe: () => {} };
    return clientRef.current.subscribe(destination, callback);
  }, []);

  return {
    subscribe,
    connected,
    error,
  };
}
