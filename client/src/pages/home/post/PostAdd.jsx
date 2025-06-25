import React, { useRef, useState, useEffect } from "react";
import { GrSend } from "react-icons/gr";
import "./PostAdd.scss";
import { useAddPostMutation } from "../../../services/api/post/PostApi";
import { useSelector } from "react-redux";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_MEDIA = 10;

const PostAdd = () => {
  const { user } = useSelector((state) => state.user);
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);
  const [text, setText] = useState("");
  const [media, setMedia] = useState([]); // array of { file, url, type }
  const [isMobile, setIsMobile] = useState(false);
  const [addPost, { isLoading, error, isSuccess }] = useAddPostMutation();

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
    let newMedia = [];
    let totalMedia = media.length;
    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        alert(`File '${file.name}' size must be less than 10MB`);
        continue;
      }
      if (totalMedia + newMedia.length >= MAX_MEDIA) {
        alert(`Maximum ${MAX_MEDIA} media files allowed per post.`);
        break;
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
    setMedia((prev) => [...prev, ...newMedia].slice(0, MAX_MEDIA));
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
  const handleShare = async () => {
    if (!text.trim() && media.length === 0) {
      alert("Please add some text or media before sharing");
      return;
    }

    const formData = new FormData();
    formData.append("content", text);
    // Append images and videos separately
    media.forEach((m) => {
      if (m.type === "image") {
        formData.append("images", m.file);
      } else if (m.type === "video") {
        formData.append("videos", m.file);
      }
    });
    // For now, send empty arrays/objects for taggedUsers and location
    formData.append("taggedUsers", JSON.stringify([]));
    formData.append("location", JSON.stringify({}));

    try {
      await addPost(formData).unwrap();
      // Reset form
      setText("");
      setMedia([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (e) {
      console.log(e);
      // Error handled below
    }
  };

  return (
    <div className='post-add'>
      <div className='post-add-header d-flex'>
        <div className='image'>
          <img src={user.profilePicture} alt='user' />
        </div>
        <textarea
          ref={textareaRef}
          type='text'
          placeholder={`What's on your mind ${user?.fullName}?`}
          value={text}
          onInput={handleTextareaInput}
          rows={1}
          disabled={isLoading}
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
            <div className='media-preview' key={m.url}>
              <button
                type='button'
                onClick={() => handleRemoveMedia(idx)}
                className='remove-media-btn'
                aria-label='Remove preview'
                disabled={isLoading}
              >
                ×
              </button>
              {m.type === "image" && <img src={m.url} alt='preview' />}
              {m.type === "video" && <video src={m.url} controls />}
            </div>
          ))}
        </div>
      )}

      <hr className='post-divider' />

      <div className='post-add-actions-row'>
        <button
          type='button'
          className='action-btn'
          onClick={handleImageButtonClick}
          aria-label='Add image or video'
          disabled={isLoading}
        >
          <input
            type='file'
            className='file-input'
            ref={fileInputRef}
            accept='image/*,video/*'
            multiple
            onChange={handleFileChange}
            disabled={isLoading || media.length >= MAX_MEDIA}
          />
          <span className='icon image-icon' />
          {isMobile ? "Media" : "Add Image / Video"}
        </button>

        <button
          type='button'
          className='action-btn'
          aria-label='Tag friends'
          disabled={isLoading}
        >
          <span className='icon tag-icon' />
          {isMobile ? "Tag" : "Tag Friends"}
        </button>

        <button
          type='button'
          className='share-btn'
          onClick={handleShare}
          disabled={(!text.trim() && media.length === 0) || isLoading}
          aria-label='Share post'
        >
          {isLoading ? "Sharing..." : <GrSend />}
        </button>
      </div>
      {error && (
        <div className='error-message'>
          {error.data?.message || "Failed to share post."}
        </div>
      )}
      {isSuccess && (
        <div className='success-message'>Post shared successfully!</div>
      )}
    </div>
  );
};

export default PostAdd;
