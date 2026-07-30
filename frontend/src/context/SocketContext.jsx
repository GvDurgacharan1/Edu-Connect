import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    const getSocketUrl = () => {
      if (import.meta.env.VITE_SOCKET_URL) {
        return import.meta.env.VITE_SOCKET_URL;
      }
      return window.location.origin;
    };

    const socketUrl = getSocketUrl();
    const socketInstance = io(socketUrl, {
      query: { userId: user._id },
      extraHeaders: {
        'bypass-tunnel-reminder': 'true'
      }
    });

    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Socket.io connected:', socketInstance.id);
      socketInstance.emit('getOnlineUsers');
    });

    socketInstance.on('onlineUsersList', (users) => {
      setOnlineUsers(users);
    });

    socketInstance.on('userStatus', ({ userId, status }) => {
      if (status === 'online') {
        setOnlineUsers((prev) => [...new Set([...prev, userId])]);
      } else {
        setOnlineUsers((prev) => prev.filter((id) => id !== userId));
      }
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers, isOnline: (userId) => onlineUsers.includes(userId) }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export default SocketContext;
