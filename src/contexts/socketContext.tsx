import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { AppState } from "react-native";
import { SOCKET_SERVER_URL } from '@env';
import { useAuth } from "./AuthContext";

// 👇 import your auth/user context


type SocketContextType = {
  socket: Socket | null;
};

const SocketContext = createContext<SocketContextType>({
  socket: null,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: any) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { user } = useAuth(); // 👈 MUST HAVE pickupId here

  useEffect(() => {
    if (!user?.pickup) return; // 🚫 don't connect without pickup

    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 2000,

      // ✅ pass pickupId to backend
      auth: {
        pickupId: user.pickup._id,
        userId: user._id,
      },
    });

    newSocket.on("connect", () => {
      console.log("🟢 Socket connected:", newSocket.id);
    });

    newSocket.on("joined_pickup", (data) => {
      console.log(" Joined pickup room:", data);
    });

    newSocket.on("connect_error", (err) => {
      console.log(" Socket connection error:", err.message);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("🔴 Socket disconnected:", reason);
    });

    setSocket(newSocket);

    const handleAppStateChange = (state: string) => {
      if (state === "active" && !newSocket.connected) {
        newSocket.connect();
      }
    };

    const sub = AppState.addEventListener("change", handleAppStateChange);

    return () => {
      newSocket.disconnect();
      sub.remove();
    };
  }, [user]); // 👈 IMPORTANT: re-run when user changes

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};