import React from "react";
import * as Fa from "react-icons/fa";

const ChatHeader = ({ user, isMobile, onBack, online }) => {
  return (
    <div className='chat-header'>
      {isMobile && (
        <button className='back-btn' onClick={onBack}>
          <Fa.FaArrowLeft />
        </button>
      )}
      <div className='chat-user-info'>
        <div className='chat-avatar'>
          <img
            src={user.avatar || user.profilePicture || "/profiles/user.jpg"}
            alt={user.name || user.username}
          />
          {online && <div className='online-indicator'></div>}
        </div>
        <div>
          <h3>{user.name || user.username}</h3>
          <span className='status'>{online ? "Online" : "Offline"}</span>
        </div>
      </div>
      <div className='chat-actions'>
        <button className='action-btn'>
          <Fa.FaPhone />
        </button>
        <button className='action-btn'>
          <Fa.FaVideo />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
