import React, { useState } from "react";
import { FaRegComment } from "react-icons/fa";
import Comment from "./Comment";
import "./comment.scss";

// Import hooks dari RTK Query API Slice
import {
  useAddCommentMutation,
  useAddReplyMutation,
  useDeleteCommentMutation,
  useLikeCommentMutation,
} from "../../services/api/post/PostApi";
import Loading from "../../components/loading/Loading";

const CommentSection = ({
  postId,
  comments = [], // Nama prop diubah agar lebih jelas
  currentUser,
}) => {
  // HAPUS: const [comments, setComments] = useState(initialComments);
  // HAPUS: const [commentIdCounter, setCommentIdCounter] = useState(1000);

  // State untuk kontrol UI tetap dipertahankan
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  // Inisialisasi Mutation Hooks dari RTK Query
  const [addComment, { isLoading: isAddingComment }] = useAddCommentMutation();
  const [addReply, { isLoading: isAddingReply }] = useAddReplyMutation();
  const [deleteComment, { isLoading: isDeletingComment }] =
    useDeleteCommentMutation();
  const [likeComment, { isLoading: isLikingComment }] =
    useLikeCommentMutation();

  // Fungsi untuk menambah komentar baru ke database
  const handleAddComment = async () => {
    if (newComment.trim()) {
      try {
        // Panggil mutasi untuk mengirim data ke server
        await addComment({
          postId,
          body: { content: newComment },
        }).unwrap(); // .unwrap() akan melempar error jika request gagal

        // Reset input text setelah berhasil
        setNewComment("");
      } catch (error) {
        console.error("Failed to add comment:", error);
      }
    }
  };

  // Fungsi untuk menambah reply ke database
  const handleReply = async (commentId, replyText) => {
    try {
      await addReply({
        postId,
        commentId,
        body: { content: replyText },
      }).unwrap();
    } catch (error) {
      console.error("Failed to add reply:", error);
    }
  };

  // Fungsi untuk menghapus komentar dari database
  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment({ postId, commentId }).unwrap();
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  // Fungsi untuk like/unlike komentar di database
  const handleLikeComment = async (commentId) => {
    try {
      await likeComment({ postId, commentId }).unwrap();
    } catch (error) {
      console.error("Failed to toggle like:", error);
    }
  };

  const isLoading =
    isAddingComment || isAddingReply || isDeletingComment || isLikingComment;

  return (
    <div className='comment-section'>
      <div
        className='comment-toggle'
        onClick={() => setShowComments(!showComments)}
      >
        <FaRegComment />
        <span>{comments.length} Comments</span>
      </div>

      {showComments && (
        <div className='comment-container'>
          <div className='comment-input-section'>
            <img
              src={currentUser.profilePicture || "default_avatar_url_here"}
              alt='avatar'
              className='comment-input-avatar'
            />
            <div className='comment-input-wrapper'>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder='Write a comment...'
                rows='2'
                className='comment-input'
              />
              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || isAddingComment}
                className='comment-submit'
              >
                {isAddingComment ? "Commenting..." : "Comment"}
              </button>
            </div>
          </div>

          <div className='comments-list'>
            {isLoading && <Loading />}
            {comments.length === 0 ? (
              <div className='no-comments'>
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              comments.map((comment) => (
                <Comment
                  key={comment.id}
                  comment={comment}
                  onReply={handleReply}
                  onDelete={handleDeleteComment}
                  onLike={handleLikeComment}
                  currentUser={currentUser}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection;
