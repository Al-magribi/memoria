import { MdShare } from "react-icons/md";
import * as Fa from "react-icons/fa";
import {
  useGetMyPostsQuery,
  useDeletePostMutation,
} from "../../services/api/post/PostApi";
import { useState } from "react";
import Loading from "../../components/loading/Loading";
import CommentSection from "../../components/comment/CommentSection";
import ReactTimeAgo from "react-time-ago";
import { useSelector } from "react-redux";
import EditPost from "./EditPost";
import { toast } from "react-toastify";
import ConfirmBox from "../../components/confirm/ConfirmBox";
import "./profileposts.scss";

const Posts = () => {
  const { user } = useSelector((state) => state.user);
  const { data, isLoading, error } = useGetMyPostsQuery();
  const [deletePost] = useDeletePostMutation();

  // Dummy data fallback jika data kosong
  const posts = data || [];

  // State untuk modal preview media
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMedia, setModalMedia] = useState([]); // array media (gabungan images & videos)
  const [modalIndex, setModalIndex] = useState(0);

  // State untuk edit modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  // State untuk konfirmasi hapus post
  const [showConfirm, setShowConfirm] = useState(false);
  const [postToDelete, setPostToDelete] = useState(null);

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

  // Fungsi buka edit modal
  const openEditModal = (post) => {
    setEditingPost(post);
    setEditModalOpen(true);
  };

  // Fungsi tutup edit modal
  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingPost(null);
  };

  // Fungsi callback ketika edit berhasil
  const handleEditSuccess = () => {
    // The query will automatically refetch due to cache invalidation
    console.log("Post updated successfully");
  };

  // Fungsi handle delete post
  const handleDeletePost = async (postId) => {
    try {
      await deletePost(postId).unwrap();
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error(error.data?.message || "Failed to delete post");
    }
    setShowConfirm(false);
    setPostToDelete(null);
  };

  // Fungsi show confirm box untuk delete
  const showDeleteConfirm = (post) => {
    setPostToDelete(post);
    setShowConfirm(true);
  };

  if (isLoading) return <Loading />;

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
              ×
            </button>
            <button className='media-modal-prev' onClick={prevMedia}>
              &lt;
            </button>
            <button className='media-modal-next' onClick={nextMedia}>
              &gt;
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

      {/* EDIT MODAL */}
      <EditPost
        isOpen={editModalOpen}
        onClose={closeEditModal}
        post={editingPost}
        onSuccess={handleEditSuccess}
      />

      {/* CONFIRM DELETE MODAL */}
      <ConfirmBox
        open={showConfirm}
        message='Are you sure you want to delete this post? This action cannot be undone.'
        onConfirm={() => postToDelete && handleDeletePost(postToDelete._id)}
        onCancel={() => {
          setShowConfirm(false);
          setPostToDelete(null);
        }}
        confirmText='Delete'
        cancelText='Cancel'
      />

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
                <img src={post.author.profilePicture} alt='avatar' />
                {/* POST INFO - Nama penulis dan waktu */}
                <div className='post-list-header-info'>
                  <span className='post-list-header-info-name'>
                    {post.author.firstName} {post.author.lastName}
                  </span>
                  <span className='post-list-header-info-time'>
                    <ReactTimeAgo date={post.createdAt} locale='en-EN' />
                    {post.isEdited && (
                      <span className='post-edited-indicator'> (edited)</span>
                    )}
                  </span>
                </div>
              </div>
              {/* ACTION BUTTON */}
              <div className='post-list-header-right'>
                <button
                  className='btn-edit'
                  onClick={() => openEditModal(post)}
                >
                  <Fa.FaEdit />
                </button>
                <button
                  className='btn-delete'
                  onClick={() => showDeleteConfirm(post)}
                >
                  <Fa.FaTrash />
                </button>
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
                <Fa.FaRegHeart />
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

export default Posts;
