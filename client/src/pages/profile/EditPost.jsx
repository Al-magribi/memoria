import { useState, useRef, useEffect } from "react";
import { useUpdatePostMutation } from "../../services/api/post/PostApi";
import "./editpost.scss";

const EditPost = ({ isOpen, onClose, post, onSuccess }) => {
  const [updatePost] = useUpdatePostMutation();

  // State untuk edit modal
  const [editContent, setEditContent] = useState("");
  const [originalImages, setOriginalImages] = useState([]);
  const [originalVideos, setOriginalVideos] = useState([]);
  const [editImages, setEditImages] = useState([]);
  const [editVideos, setEditVideos] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [newVideos, setNewVideos] = useState([]);
  const [removedImageIndexes, setRemovedImageIndexes] = useState([]);
  const [removedVideoIndexes, setRemovedVideoIndexes] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState("");

  // Refs untuk file inputs
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Initialize modal when post changes
  useEffect(() => {
    if (post && isOpen) {
      setEditContent(post.content || "");
      setOriginalImages(post.images || []);
      setOriginalVideos(post.videos || []);
      setEditImages(post.images || []);
      setEditVideos(post.videos || []);
      setNewImages([]);
      setNewVideos([]);
      setRemovedImageIndexes([]);
      setRemovedVideoIndexes([]);
      setUpdateError("");
    }
  }, [post, isOpen]);

  // Fungsi handle image input
  const handleImageInput = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
  };

  // Fungsi handle video input
  const handleVideoInput = (e) => {
    const files = Array.from(e.target.files);
    setNewVideos(files);
  };

  // Fungsi hapus image yang ada
  const removeExistingImage = (index) => {
    // Find the original index of this image
    const originalIndex = originalImages.findIndex(
      (img) => img === editImages[index]
    );
    if (originalIndex !== -1) {
      setRemovedImageIndexes([...removedImageIndexes, originalIndex]);
    }
    setEditImages(editImages.filter((_, i) => i !== index));
  };

  // Fungsi hapus video yang ada
  const removeExistingVideo = (index) => {
    // Find the original index of this video
    const originalIndex = originalVideos.findIndex(
      (vid) => vid === editVideos[index]
    );
    if (originalIndex !== -1) {
      setRemovedVideoIndexes([...removedVideoIndexes, originalIndex]);
    }
    setEditVideos(editVideos.filter((_, i) => i !== index));
  };

  // Fungsi hapus image baru
  const removeNewImage = (index) => {
    setNewImages(newImages.filter((_, i) => i !== index));
  };

  // Fungsi hapus video baru
  const removeNewVideo = (index) => {
    setNewVideos(newVideos.filter((_, i) => i !== index));
  };

  // Fungsi update post
  const handleUpdatePost = async () => {
    if (!post) return;

    setIsUpdating(true);
    setUpdateError("");

    try {
      const formData = new FormData();
      formData.append("content", editContent);

      // Add new images
      newImages.forEach((image) => {
        formData.append("images", image);
      });

      // Add new videos
      newVideos.forEach((video) => {
        formData.append("videos", video);
      });

      // Add removed image indexes if any
      if (removedImageIndexes.length > 0) {
        formData.append("removeImages", JSON.stringify(removedImageIndexes));
      }

      // Add removed video indexes if any
      if (removedVideoIndexes.length > 0) {
        formData.append("removeVideos", JSON.stringify(removedVideoIndexes));
      }

      await updatePost({
        postId: post._id,
        body: formData,
      }).unwrap();

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error updating post:", error);
      setUpdateError(
        error.data?.message || "Failed to update post. Please try again."
      );
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen || !post) return null;

  return (
    <div className='edit-modal-overlay' onClick={onClose}>
      <div className='edit-modal-content' onClick={(e) => e.stopPropagation()}>
        <div className='edit-modal-header'>
          <h3>Edit Post</h3>
          <button className='edit-modal-close' onClick={onClose}>
            ×
          </button>
        </div>

        <div className='edit-modal-body'>
          {/* Error Display */}
          {updateError && (
            <div className='edit-error-message'>{updateError}</div>
          )}

          {/* Content Text */}
          <div className='edit-content-section'>
            <label>Content:</label>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
            />
          </div>

          {/* Existing Images */}
          {editImages.length > 0 && (
            <div className='edit-existing-media'>
              <label>Current Images:</label>
              <div className='edit-media-grid'>
                {editImages.map((image, index) => (
                  <div key={index} className='edit-media-item'>
                    <img src={image} alt={`image-${index}`} />
                    <button
                      className='remove-media-btn'
                      onClick={() => removeExistingImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Existing Videos */}
          {editVideos.length > 0 && (
            <div className='edit-existing-media'>
              <label>Current Videos:</label>
              <div className='edit-media-grid'>
                {editVideos.map((video, index) => (
                  <div key={index} className='edit-media-item'>
                    <video src={video} controls />
                    <button
                      className='remove-media-btn'
                      onClick={() => removeExistingVideo(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Images */}
          {newImages.length > 0 && (
            <div className='edit-new-media'>
              <label>New Images:</label>
              <div className='edit-media-grid'>
                {newImages.map((image, index) => (
                  <div key={index} className='edit-media-item'>
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`new-image-${index}`}
                    />
                    <button
                      className='remove-media-btn'
                      onClick={() => removeNewImage(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* New Videos */}
          {newVideos.length > 0 && (
            <div className='edit-new-media'>
              <label>New Videos:</label>
              <div className='edit-media-grid'>
                {newVideos.map((video, index) => (
                  <div key={index} className='edit-media-item'>
                    <video src={URL.createObjectURL(video)} controls />
                    <button
                      className='remove-media-btn'
                      onClick={() => removeNewVideo(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Inputs */}
          <div className='edit-file-inputs'>
            <div className='file-input-group'>
              <label>Add Images:</label>
              <input
                type='file'
                ref={imageInputRef}
                multiple
                accept='image/*'
                onChange={handleImageInput}
                style={{ display: "none" }}
              />
              <button
                className='file-input-btn'
                onClick={() => imageInputRef.current?.click()}
              >
                Choose Images
              </button>
            </div>

            <div className='file-input-group'>
              <label>Add Videos:</label>
              <input
                type='file'
                ref={videoInputRef}
                multiple
                accept='video/*'
                onChange={handleVideoInput}
                style={{ display: "none" }}
              />
              <button
                className='file-input-btn'
                onClick={() => videoInputRef.current?.click()}
              >
                Choose Videos
              </button>
            </div>
          </div>
        </div>

        <div className='edit-modal-footer'>
          <button
            className='btn-cancel'
            onClick={onClose}
            disabled={isUpdating}
          >
            Cancel
          </button>
          <button
            className='btn-save'
            onClick={handleUpdatePost}
            disabled={isUpdating}
          >
            {isUpdating ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPost;
