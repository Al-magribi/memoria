import { MdShare } from "react-icons/md";
import { FaRegHeart, FaRegComment } from "react-icons/fa";
import { useGetMyPostsQuery } from "../../services/api/post/PostApi";
import { useState } from "react";

const Posts = () => {
  const { data, isLoading, error } = useGetMyPostsQuery();

  console.log(data);

  // Dummy data fallback jika data kosong
  const posts = data || [];

  // State untuk modal preview media
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMedia, setModalMedia] = useState([]); // array media (gabungan images & videos)
  const [modalIndex, setModalIndex] = useState(0);

  // Fungsi buka modal
  const openModal = (mediaArr, idx) => {
    setModalMedia(mediaArr);
    setModalIndex(idx);
    setModalOpen(true);
  };

  // Fungsi tutup modal
  const closeModal = () => {
    setModalOpen(false);
    setModalMedia([]);
    setModalIndex(0);
  };

  // Fungsi navigasi
  const prevMedia = () => {
    setModalIndex((prev) => (prev === 0 ? modalMedia.length - 1 : prev - 1));
  };
  const nextMedia = () => {
    setModalIndex((prev) => (prev === modalMedia.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="profile-post-list-container">
      {/* MODAL PREVIEW MEDIA */}
      {modalOpen && (
        <div className="media-modal-overlay" onClick={closeModal}>
          <div
            className="media-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="media-modal-close" onClick={closeModal}>
              ×
            </button>
            <button className="media-modal-prev" onClick={prevMedia}>
              &lt;
            </button>
            <button className="media-modal-next" onClick={nextMedia}>
              &gt;
            </button>
            {modalMedia[modalIndex]?.type === "image" ? (
              <img
                src={modalMedia[modalIndex].src}
                alt="media"
                className="media-modal-img"
              />
            ) : (
              <video
                src={modalMedia[modalIndex].src}
                controls
                className="media-modal-video"
              />
            )}
          </div>
        </div>
      )}
      {posts.map((post) => {
        // Gabungkan images & videos jadi satu array untuk gallery
        const gallery = [
          ...(post.images?.map((img) => ({ type: "image", src: img })) || []),
          ...(post.videos?.map((vid) => ({ type: "video", src: vid })) || []),
        ];
        return (
          <div className="profile-post-list" key={post.id || post._id}>
            <div className="profile-post-list-header">
              <div className="profile-post-list-header-left">
                <img src={post.author.profilePicture} alt="avatar" />
                <div className="profile-post-list-header-info">
                  <span className="profile-post-list-header-info-name">
                    {post.author.firstName
                      ? `${post.author.firstName} ${post.author.lastName}`
                      : post.author || ""}
                  </span>
                  <span className="profile-post-list-header-info-time">
                    {post.createdAt}
                  </span>
                </div>
              </div>
            </div>
            <div className="profile-post-list-content">
              <div className="profile-post-list-content-text">
                <span>{post.content}</span>
              </div>
              {/* GALLERY GRID */}
              {gallery.length > 0 && (
                <div className="post-list-gallery-grid">
                  {gallery.slice(0, 4).map((media, idx) => (
                    <div
                      key={idx}
                      className="post-list-gallery-item"
                      onClick={() => openModal(gallery, idx)}
                    >
                      {media.type === "image" ? (
                        <img src={media.src} alt="gallery" />
                      ) : (
                        <video src={media.src} />
                      )}
                      {/* Jika media ke-4 dan masih ada sisa, tampilkan overlay +N */}
                      {idx === 3 && gallery.length > 4 && (
                        <div className="post-list-gallery-more">
                          +{gallery.length - 4}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="profile-post-list-footer">
              <span className="profile-post-list-footer-like">
                <FaRegHeart />
              </span>
              <span className="profile-post-list-footer-comment">
                <FaRegComment />
              </span>
              <span className="profile-post-list-footer-share">
                <MdShare />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Posts;
