import React from "react";
import * as Fa from "react-icons/fa";

const ChatInput = ({
  messageInput,
  onInputChange,
  onKeyPress,
  onSend,
  disabled,
}) => {
  return (
    <div className='message-input-container'>
      <div className='message-input-wrapper'>
        <textarea
          className='message-textarea'
          placeholder='Type a message...'
          value={messageInput}
          onChange={onInputChange}
          onKeyDown={onKeyPress}
          rows={1}
          disabled={disabled}
        />
        <button
          className='send-btn'
          onClick={onSend}
          disabled={!messageInput.trim() || disabled}
        >
          <Fa.FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
