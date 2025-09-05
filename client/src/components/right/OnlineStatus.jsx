import React from "react";
import { FaCircle } from "react-icons/fa";
import { useSocket } from "../../context/SocketContext";

const OnlineStatus = ({
  userId,
  isOnlineFromAPI = false,
  showText = false,
  size = "small",
}) => {
  const { onlineUsers } = useSocket();

  // Check both API data and socket state for online status
  const isOnlineFromSocket = onlineUsers.has(userId?.toString());
  const isOnline = isOnlineFromAPI || isOnlineFromSocket;

  if (!isOnline) {
    return showText ? (
      <span className='status-text offline'>Offline</span>
    ) : null;
  }

  const sizeClasses = {
    small: "w-3 h-3",
    medium: "w-4 h-4",
    large: "w-5 h-5",
  };

  return (
    <div className='online-status'>
      <FaCircle
        className={`online-indicator ${sizeClasses[size]}`}
        style={{
          color: "#31a24c",
          fontSize:
            size === "small" ? "12px" : size === "medium" ? "16px" : "20px",
        }}
      />
      {showText && <span className='status-text online'>Online</span>}
    </div>
  );
};

export default OnlineStatus;
