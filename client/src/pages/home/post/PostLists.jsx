import "./postlists.scss";
import {
  MdShare,
  MdClose,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
} from "react-icons/md";
import { FaRegHeart } from "react-icons/fa";
import CommentSection from "../../../components/comment/CommentSection";
import { useGetFeedPostsQuery } from "../../../services/api/post/PostApi";
import ReactTimeAgo from "react-time-ago";
import { useSelector } from "react-redux";
import { useState } from "react";
import Loading from "../../../components/loading/Loading";

const coverPhotoPlaceholder =
  "https://avitek.vn/wp-content/uploads/2020/08/Image-Placeholder-Dark.png";

const PostLists = () => {
  const { user } = useSelector((state) => state.user);
  const { data, isLoading, error } = useGetFeedPostsQuery();

  const posts = data || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMedia, setModalMedia] = useState([]);
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

  if (isLoading) return <Loading />;

  // RENDER COMPONENT - Tampilkan daftar post
  return (
    <div className='d-flex flex-column'>
      {/* MODAL PREVIEW MEDIA */}
      {modalOpen && (
        <div className='media-modal-overlay' onClick={closeModal}>
          <div
            className='media-modal-content'
            onClick={(e) => e.stopPropagation()}
          >
            <button className='media-modal-close' onClick={closeModal}>
              <MdClose />
            </button>
            <button className='media-modal-prev' onClick={prevMedia}>
              <MdKeyboardArrowLeft />
            </button>
            <button className='media-modal-next' onClick={nextMedia}>
              <MdKeyboardArrowRight />
            </button>
            {modalMedia[modalIndex]?.type === "image" ? (
              <img
                src={modalMedia[modalIndex].src}
                alt='media'
                className='media-modal-img'
              />
            ) : (
              <video
                src={modalMedia[modalIndex].src}
                controls
                className='media-modal-video'
              />
            )}
          </div>
        </div>
      )}
      {/* MAP SETIAP POST - Render setiap post dalam array */}
      {posts?.map((post) => {
        // Gabungkan images & videos jadi satu array untuk gallery
        const gallery = [
          ...(post.images?.map((img) => ({
            type: "image",
            src: img,
          })) || []),
          ...(post.videos?.map((vid) => ({
            type: "video",
            src: vid,
          })) || []),
        ];
        return (
          <div className='post-list' key={post._id}>
            {/* POST HEADER - Bagian atas post (avatar, nama, waktu) */}
            <div className='post-list-header'>
              <div className='post-list-header-left'>
                {/* AVATAR - Foto profil penulis post */}
                <img
                  src={post.author.profilePicture || coverPhotoPlaceholder}
                  alt='avatar'
                  loading='lazy'
                />
                {/* POST INFO - Nama penulis dan waktu */}
                <div className='post-list-header-info'>
                  <span className='post-list-header-info-name'>
                    {post.author.firstName} {post.author.lastName}
                  </span>
                  <span className='post-list-header-info-time'>
                    <ReactTimeAgo date={post.createdAt} locale='en-EN' />
                  </span>
                </div>
              </div>
            </div>
            {/* POST CONTENT - Bagian konten post */}
            <div className='post-list-content'>
              {/* POST TEXT - Teks konten post */}
              <div className='post-list-content-text'>
                <span>{post.content}</span>
              </div>
              {/* GALLERY GRID */}
              {gallery.length === 1 ? (
                <div
                  className='post-list-content-single-media'
                  onClick={() => openModal(gallery, 0)}
                >
                  {gallery[0].type === "image" ? (
                    <img src={gallery[0].src} alt='gallery' loading='lazy' />
                  ) : (
                    <video src={gallery[0].src} loading='lazy' />
                  )}
                </div>
              ) : (
                gallery.length > 1 && (
                  <div className='post-list-gallery-grid'>
                    {gallery.slice(0, 4).map((media, idx) => (
                      <div
                        key={idx}
                        className='post-list-gallery-item'
                        onClick={() => openModal(gallery, idx)}
                      >
                        {media.type === "image" ? (
                          <img src={media.src} alt='gallery' loading='lazy' />
                        ) : (
                          <video src={media.src} loading='lazy' />
                        )}
                        {/* Jika media ke-4 dan masih ada sisa, tampilkan overlay +N */}
                        {idx === 3 && gallery.length > 4 && (
                          <div className='post-list-gallery-more'>
                            +{gallery.length - 4}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
            {/* POST FOOTER - Tombol like dan share */}
            <div className='post-list-footer'>
              {/* LIKE BUTTON */}
              <span className='post-list-footer-like'>
                <FaRegHeart />
              </span>
              {/* SHARE BUTTON */}
              <span className='post-list-footer-share'>
                <MdShare />
              </span>
            </div>
            {/* COMMENT SECTION - Sistem komentar lengkap */}
            <CommentSection
              postId={post._id} // ID post untuk identifikasi
              comments={post.comments} // Array komentar post ini
              currentUser={user} // Data user yang sedang login
            />
          </div>
        );
      })}
    </div>
  );
};

export default PostLists;
