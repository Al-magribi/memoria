import { useRef } from "react";
import * as Fa from "react-icons/fa";

const ChatInput = ({
  messageInput,
  onInputChange,
  onKeyPress,
  onSend,
  disabled,
  onAttach,
  attachedFiles = [],
  onRemoveFile,
  isUploading = false,
}) => {
  const fileInputRef = useRef(null);

  // Helper function to format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className='message-input-container'>
      {/* File Preview Section */}
      {attachedFiles.length > 0 && (
        <div className='file-preview-container'>
          <div className='file-preview-list'>
            {attachedFiles.map((fileData) => (
              <div key={fileData.id} className='file-preview-item'>
                <div className='file-preview-content'>
                  {fileData.type.startsWith("image/") ? (
                    <img
                      src={fileData.preview}
                      alt={fileData.name}
                      className='file-preview-image'
                    />
                  ) : (
                    <div className='file-preview-icon'>{fileData.icon}</div>
                  )}
                  <div className='file-preview-info'>
                    <div className='file-name'>{fileData.name}</div>
                    <div className='file-size'>
                      {formatFileSize(fileData.size)}
                    </div>
                  </div>
                </div>
                <button
                  className='remove-file-btn'
                  onClick={() => onRemoveFile(fileData.id)}
                  disabled={isUploading}
                >
                  <Fa.FaTimes />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className='message-input-wrapper'>
        <button
          className='attach-btn'
          onClick={() => fileInputRef.current.click()}
          disabled={disabled || isUploading}
        >
          <Fa.FaPaperclip />
        </button>

        <input
          type='file'
          multiple
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={onAttach}
          disabled={disabled || isUploading}
        />

        <textarea
          className='message-textarea'
          placeholder={isUploading ? "Uploading files..." : "Type a message..."}
          value={messageInput}
          onChange={onInputChange}
          onKeyDown={onKeyPress}
          rows={1}
          disabled={disabled || isUploading}
        />

        <button
          className='send-btn'
          onClick={onSend}
          disabled={
            (!messageInput.trim() && attachedFiles.length === 0) ||
            disabled ||
            isUploading
          }
        >
          <Fa.FaPaperPlane />
        </button>
      </div>
    </div>
  );
};

export default ChatInput;
