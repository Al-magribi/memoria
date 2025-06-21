import React, { useState } from "react";
import {
  FaRegHeart,
  FaHeart,
  FaRegComment,
  FaReply,
  FaTrash,
} from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";
import "./comment.scss";

/**
 * COMMENT COMPONENT
 *
 * Komponen ini bertanggung jawab untuk menampilkan satu komentar individual.
 * Fitur yang tersedia:
 * - Menampilkan data komentar (author, content, time, likes)
 * - Like/unlike komentar
 * - Reply ke komentar
 * - Hapus komentar (hanya untuk pemilik)
 * - Tampilkan replies (nested comments)
 *
 * KONSEP DASAR:
 * - Props: Data yang diterima dari parent (comment, onReply, onDelete, onLike, currentUser)
 * - State: Data lokal untuk UI control (showReplies, isReplying, replyText)
 * - Conditional Rendering: Tampilkan elemen berdasarkan kondisi tertentu
 */
const Comment = ({ comment, onReply, onDelete, onLike, currentUser }) => {
  // STATE MANAGEMENT - Data lokal untuk mengontrol UI

  // State untuk mengontrol tampilan replies (buka/tutup)
  const [showReplies, setShowReplies] = useState(false);

  // State untuk mengontrol tampilan form reply (buka/tutup)
  const [isReplying, setIsReplying] = useState(false);

  // State untuk menyimpan teks reply yang sedang diketik
  const [replyText, setReplyText] = useState("");

  /**
   * FUNGSI UNTUK MENAMBAH REPLY
   *
   * Alur kerja:
   * 1. Cek apakah ada teks yang diketik
   * 2. Panggil function onReply dari parent dengan ID komentar dan teks
   * 3. Reset form reply dan tutup form
   */
  const handleReply = () => {
    if (replyText.trim()) {
      // Pastikan tidak kosong
      onReply(comment.id, replyText); // Kirim ke parent component
      setReplyText(""); // Reset input text
      setIsReplying(false); // Tutup form reply
    }
  };

  /**
   * FUNGSI UNTUK TOGGLE TAMPILAN REPLIES
   *
   * Toggle boolean showReplies untuk buka/tutup daftar replies
   */
  const handleShowReplies = () => {
    setShowReplies(!showReplies); // Toggle boolean
  };

  /**
   * FUNGSI UNTUK LIKE/UNLIKE KOMENTAR
   *
   * Panggil function onLike dari parent dengan ID komentar
   */
  const handleLike = () => {
    onLike(comment.id); // Kirim ID ke parent component
  };

  /**
   * CEK STATUS LIKE KOMENTAR
   *
   * Menggunakan optional chaining (?.) untuk menghindari error
   * Cek apakah currentUser.id ada di array likedBy
   */
  const isLiked = comment.likedBy?.includes(currentUser?.id);

  // RENDER COMPONENT - Tampilkan UI
  return (
    <div className='comment'>
      {/* COMMENT HEADER - Bagian atas komentar (avatar, nama, waktu, delete) */}
      <div className='comment-header'>
        {/* AVATAR - Foto profil penulis komentar */}
        <img
          src={comment.author.profilePicture}
          alt='avatar'
          className='comment-avatar'
        />

        {/* COMMENT INFO - Nama penulis dan waktu */}
        <div className='comment-info'>
          <span className='comment-author'>{comment.author.name}</span>
          <span className='comment-time'>
            {/* Format waktu menggunakan date-fns */}
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true, // Tambah "ago" di akhir
            })}
          </span>
        </div>

        {/* DELETE BUTTON - Hanya tampilkan untuk pemilik komentar */}
        {currentUser?.id === comment.author.id && (
          <button
            className='comment-delete'
            onClick={() => onDelete(comment.id)} // Panggil function delete
          >
            <FaTrash />
          </button>
        )}
      </div>

      {/* COMMENT CONTENT - Isi komentar */}
      <div className='comment-content'>
        <p>{comment.content}</p>
      </div>

      {/* COMMENT ACTIONS - Tombol like dan reply */}
      <div className='comment-actions'>
        {/* LIKE BUTTON - Dengan visual feedback */}
        <button
          className={`comment-action ${isLiked ? "liked" : ""}`} // Conditional class
          onClick={handleLike}
        >
          {/* Conditional rendering - Icon berbeda berdasarkan status like */}
          {isLiked ? <FaHeart /> : <FaRegHeart />}
          <span>{comment.likes || 0}</span> {/* Tampilkan jumlah likes */}
        </button>

        {/* REPLY BUTTON - Untuk membuka form reply */}
        <button
          className='comment-action'
          onClick={() => setIsReplying(!isReplying)} // Toggle form reply
        >
          <FaReply />
          <span>Reply</span>
        </button>
      </div>

      {/* REPLY FORM - Form untuk menulis reply */}
      {isReplying && (
        <div className='comment-reply-form'>
          {/* TEXTAREA - Input untuk menulis reply */}
          <textarea
            value={replyText} // Controlled component
            onChange={(e) => setReplyText(e.target.value)} // Update state saat ketik
            placeholder='Write a reply...'
            rows='2'
          />

          {/* REPLY ACTIONS - Tombol submit dan cancel */}
          <div className='comment-reply-actions'>
            <button onClick={handleReply} className='reply-submit'>
              Reply
            </button>
            <button
              onClick={() => setIsReplying(false)} // Tutup form tanpa submit
              className='reply-cancel'
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* REPLIES SECTION - Daftar replies komentar */}
      {comment.replies && comment.replies.length > 0 && (
        <div className='comment-replies'>
          {/* TOGGLE BUTTON - Untuk buka/tutup daftar replies */}
          <button className='show-replies-btn' onClick={handleShowReplies}>
            {/* Conditional text berdasarkan status showReplies */}
            {showReplies ? "Hide" : `Show ${comment.replies.length} replies`}
          </button>

          {/* REPLIES LIST - Daftar replies (conditional rendering) */}
          {showReplies && (
            <div className='replies-list'>
              {/* Map setiap reply ke component Comment (recursive) */}
              {comment.replies.map((reply) => (
                <Comment
                  key={reply.id} // Key untuk React optimization
                  comment={reply} // Data reply
                  onReply={onReply} // Function untuk reply
                  onDelete={onDelete} // Function untuk delete
                  onLike={onLike} // Function untuk like
                  currentUser={currentUser} // Data user saat ini
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Comment;
