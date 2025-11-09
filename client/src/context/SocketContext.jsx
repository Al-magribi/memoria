import { createContext, useContext, useEffect, useState } from "react";
import io from "socket.io-client";
import { useSelector } from "react-redux";

const Context = createContext();

export const useSocket = () => {
  return useContext(Context);
};

const SocketContext = ({ children }) => {
  const { user } = useSelector((state) => state.user);
  const [socket, setSocket] = useState();

  useEffect(() => {
    if (user && user._id) {
      const newSocket = io(import.meta.env.VITE_API_URL);

      setSocket(newSocket);

      newSocket.emit("join", user._id);
      console.log(`Socket 'join' emitted for user: ${user._id}`);

      return () => {
        newSocket.disconnect();
        setSocket(null);
      };
    } else if (!user && socket) {
      socket.disconnect();
      setSocket(null);
    }
  }, [user]);

  return <Context.Provider value={socket}>{children}</Context.Provider>;
};

export default SocketContext;
