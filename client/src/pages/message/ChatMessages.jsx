import React from "react";
import { FaComments } from "react-icons/fa";
import { IoCheckmarkDone, IoCheckmark } from "react-icons/io5";

const ChatMessages = ({
  messages = [],
  hasMessages,
  typingUsers,
  user,
  messagesEndRef,
}) => {
  return (
    <div className='messages-container'>
      <div className='messages'>
        {hasMessages ? (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.isOwn ? "own" : "other"}`}
            >
              <div className='message-content'>
                {msg.messageType === "image" && msg.fileUrl ? (
                  <img
                    src={msg.fileUrl}
                    alt={msg.message || "image"}
                    className='chat-media-message'
                  />
                ) : msg.messageType === "video" && msg.fileUrl ? (
                  <video
                    src={msg.fileUrl}
                    controls
                    className='chat-media-message'
                  />
                ) : (
                  <p>{msg.message}</p>
                )}
                <span className='message-time'>{msg.time}</span>
              </div>
            </div>
          ))
        ) : (
          <div className='start-chat-message'>
            <div className='start-chat-content'>
              <FaComments />
              <h3>Start a conversation</h3>
              <p>
                Send a message to begin chatting with{" "}
                {user.name || user.username}
              </p>
            </div>
          </div>
        )}
        {typingUsers && typingUsers.size > 0 && (
          <div className='message other typing-message'>
            <div className='message-content'>
              <p className='typing-indicator'>is typing...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default ChatMessages;
