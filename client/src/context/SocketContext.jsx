import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import { useGetTokenQuery } from "../services/api/user/UserApi";

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());

  const { data: tokenData, error } = useGetTokenQuery();
  const token = tokenData?.token;

  useEffect(() => {
    if (!token) {
      console.log("No token available, skipping socket connection");
      return;
    }

    const newSocket = io(import.meta.env.VITE_API, {
      auth: { token },
      transports: ["websocket", "polling"],
      withCredentials: true,
    });

    newSocket.on("connect", () => {
      console.log("Connected to Socket.IO server");
      setIsConnected(true);
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from Socket.IO server");
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      console.error("Error details:", error.message);
      setIsConnected(false);
    });

    newSocket.on("userOnline", (userId) => {
      setOnlineUsers((prev) => new Set([...prev, userId]));
    });

    newSocket.on("userOffline", (userId) => {
      setOnlineUsers((prev) => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [token]);

  const value = {
    socket,
    isConnected,
    onlineUsers,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
