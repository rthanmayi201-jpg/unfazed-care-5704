import { useEffect, useRef, useState, useCallback } from 'react';
import { getSocket } from '../utils/socketClient.js';

export function useSocket(events = {}) {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;
    setIsConnected(socket.connected);

    // Register event listeners
    Object.entries(events).forEach(([eventName, handler]) => {
      socket.on(eventName, handler);
    });

    return () => {
      Object.entries(events).forEach(([eventName, handler]) => {
        socket.off(eventName, handler);
      });
    };
  }, []);

  const emit = useCallback((event, data) => {
    if (socketRef.current) {
      socketRef.current.emit(event, data);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    emit
  };
}
