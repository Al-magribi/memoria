import React, { useRef, useState, useEffect } from "react";
import { GrSend } from "react-icons/gr";
import "./PostAdd.scss";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const PostAdd = () => {
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [text, setText] = useState("");
  const [media, setMedia] = useState([]); // array of { file, url, type }
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleImageButtonClick = () => {
    fileInputRef.current.click();
  };

  // Auto grow textarea with mobile optimization
  const handleTextareaInput = (e) => {
    setText(e.target.value);
    const textarea = textareaRef.current;
    textarea.style.height = "auto";

    // Limit height on mobile to prevent excessive growth
    const maxHeight = isMobile ? 120 : 200;
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = newHeight + "px";
  };

  // Handle file input change with better mobile support
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const newMedia = [];

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File '${file.name}' size must be less than 10MB`);
        continue;
      }

      const url = URL.createObjectURL(file);
      const type = file.type.startsWith("image")
        ? "image"
        : file.type.startsWith("video")
        ? "video"
        : null;

      if (type) {
        newMedia.push({ file, url, type });
      }
    }

    setMedia((prev) => [...prev, ...newMedia]);
    // Reset input agar bisa pilih file yang sama lagi
    e.target.value = null;
  };

  // Hapus media tertentu
  const handleRemoveMedia = (idx) => {
    setMedia((prev) => {
      // Revoke object URL agar tidak memory leak
      URL.revokeObjectURL(prev[idx].url);
      return prev.filter((_, i) => i !== idx);
    });
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  // Handle share button click
  const handleShare = () => {
    if (!text.trim() && media.length === 0) {
      alert("Please add some text or media before sharing");
      return;
    }

    // TODO: Implement actual sharing logic
    console.log("Sharing post:", { text, media });
    alert("Post shared successfully!");

    // Reset form
    setText("");
    setMedia([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const user = {
    name: "Jadid Al Magribi",
    title: "Full Stack Developer",
    profilePicture: "./user-1.jpg",
  };

  return (
    <div className="post-add">
      <div className="post-add-header d-flex">
        <div className="image">
          <img src={user.profilePicture} alt="user" />
        </div>
        <textarea
          ref={textareaRef}
          type="text"
          placeholder={`What's on your mind ${user.name}?`}
          value={text}
          onInput={handleTextareaInput}
          rows={1}
        />
      </div>

      {media.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: isMobile ? "8px" : "12px",
            marginBottom: "12px",
          }}
        >
          {media.map((m, idx) => (
            <div className="media-preview" key={m.url}>
              <button
                type="button"
                onClick={() => handleRemoveMedia(idx)}
                className="remove-media-btn"
                aria-label="Remove preview"
              >
                ×
              </button>
              {m.type === "image" && <img src={m.url} alt="preview" />}
              {m.type === "video" && <video src={m.url} controls />}
            </div>
          ))}
        </div>
      )}

      <hr className="post-divider" />

      <div className="post-add-actions-row">
        <button
          type="button"
          className="action-btn"
          onClick={handleImageButtonClick}
          aria-label="Add image or video"
        >
          <input
            type="file"
            className="file-input"
            ref={fileInputRef}
            accept="image/*,video/*"
            multiple
            onChange={handleFileChange}
          />
          <span className="icon image-icon" />
          {isMobile ? "Media" : "Add Image / Video"}
        </button>

        <button type="button" className="action-btn" aria-label="Tag friends">
          <span className="icon tag-icon" />
          {isMobile ? "Tag" : "Tag Friends"}
        </button>

        <button
          type="button"
          className="share-btn"
          onClick={handleShare}
          disabled={!text.trim() && media.length === 0}
          aria-label="Share post"
        >
          <GrSend />
        </button>
      </div>
    </div>
  );
};

export default PostAdd;
