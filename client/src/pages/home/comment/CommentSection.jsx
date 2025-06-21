import React, { useState } from "react";
import { FaRegComment } from "react-icons/fa";
import Comment from "./Comment";
import "./comment.scss";

/**
 * COMMENT SECTION COMPONENT
 *
 * Komponen ini bertanggung jawab untuk mengelola seluruh sistem komentar pada sebuah post.
 * Fitur yang tersedia:
 * - Menampilkan daftar komentar
 * - Menambah komentar baru
 * - Reply ke komentar
 * - Like/unlike komentar
 * - Hapus komentar
 *
 * KONSEP DASAR:
 * - State: Data yang bisa berubah (komentar, show/hide, input text)
 * - Props: Data yang diterima dari parent component (postId, comments, currentUser)
 * - Event Handler: Fungsi yang dijalankan ketika user melakukan aksi
 */
const CommentSection = ({
  postId, // ID dari post yang sedang ditampilkan
  comments: initialComments = [], // Daftar komentar awal (dari props)
  currentUser, // Data user yang sedang login
}) => {
  // STATE MANAGEMENT - Data yang bisa berubah dalam komponen ini

  // State untuk menyimpan daftar komentar (bisa bertambah/hilang)
  const [comments, setComments] = useState(initialComments);

  // State untuk mengontrol tampilan comment section (buka/tutup)
  const [showComments, setShowComments] = useState(false);

  // State untuk menyimpan teks yang sedang diketik user
  const [newComment, setNewComment] = useState("");

  // Counter untuk memberikan ID unik pada setiap komentar baru
  // Dimulai dari 1000 untuk menghindari konflik dengan data dummy
  const [commentIdCounter, setCommentIdCounter] = useState(1000);

  // Data user default jika tidak ada currentUser
  const user = currentUser || {
    id: 1,
    name: "Current User",
    profilePicture:
      "https://images.pexels.com/photos/2092474/pexels-photo-2092474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  };

  /**
   * FUNGSI UNTUK MENAMBAH KOMENTAR BARU
   *
   * Alur kerja:
   * 1. Cek apakah ada teks yang diketik (tidak boleh kosong)
   * 2. Buat objek komentar baru dengan data lengkap
   * 3. Tambahkan ke array comments yang sudah ada
   * 4. Reset input text dan naikkan counter ID
   */
  const handleAddComment = () => {
    if (newComment.trim()) {
      // Pastikan tidak kosong
      // Buat objek komentar baru
      const comment = {
        id: commentIdCounter, // ID unik
        content: newComment, // Isi komentar
        createdAt: new Date().toISOString(), // Waktu dibuat (format ISO)
        author: user, // Data penulis
        likes: 0, // Jumlah like awal
        likedBy: [], // Array user yang sudah like
        replies: [], // Array untuk reply
      };

      // Tambahkan komentar baru ke array yang sudah ada
      setComments([...comments, comment]);

      // Naikkan counter untuk komentar berikutnya
      setCommentIdCounter(commentIdCounter + 1);

      // Reset input text
      setNewComment("");
    }
  };

  /**
   * FUNGSI UNTUK MENAMBAH REPLY KE KOMENTAR
   *
   * Alur kerja:
   * 1. Buat objek reply baru
   * 2. Cari komentar yang akan di-reply berdasarkan ID
   * 3. Tambahkan reply ke array replies komentar tersebut
   * 4. Gunakan recursive function untuk mencari di nested replies
   *
   * @param {number} commentId - ID komentar yang akan di-reply
   * @param {string} replyText - Teks reply
   */
  const handleReply = (commentId, replyText) => {
    // Buat objek reply baru
    const reply = {
      id: commentIdCounter, // ID unik
      content: replyText, // Isi reply
      createdAt: new Date().toISOString(), // Waktu dibuat
      author: user, // Data penulis
      likes: 0, // Jumlah like awal
      likedBy: [], // Array user yang sudah like
      replies: [], // Array untuk reply (kosong)
    };

    /**
     * RECURSIVE FUNCTION - Fungsi yang memanggil dirinya sendiri
     *
     * Fungsi ini mencari komentar berdasarkan ID dan menambahkan reply
     * Bisa mencari di level komentar utama maupun di nested replies
     *
     * @param {Array} comments - Array komentar yang akan dicari
     * @returns {Array} - Array komentar yang sudah diupdate
     */
    const addReplyToComment = (comments) => {
      return comments.map((comment) => {
        // Jika ID komentar cocok, tambahkan reply
        if (comment.id === commentId) {
          return {
            ...comment, // Spread operator - copy semua property
            replies: [...(comment.replies || []), reply], // Tambah reply baru
          };
        }
        // Jika ada replies, cari lagi di dalam replies (recursive)
        if (comment.replies) {
          return {
            ...comment,
            replies: addReplyToComment(comment.replies),
          };
        }
        // Jika bukan komentar yang dicari, kembalikan tanpa perubahan
        return comment;
      });
    };

    // Update state dengan komentar yang sudah ditambah reply
    setComments(addReplyToComment(comments));

    // Naikkan counter untuk komentar berikutnya
    setCommentIdCounter(commentIdCounter + 1);
  };

  /**
   * FUNGSI UNTUK MENGHAPUS KOMENTAR
   *
   * Alur kerja:
   * 1. Cari komentar berdasarkan ID
   * 2. Filter out komentar yang akan dihapus
   * 3. Gunakan recursive function untuk mencari di nested replies
   *
   * @param {number} commentId - ID komentar yang akan dihapus
   */
  const handleDeleteComment = (commentId) => {
    /**
     * RECURSIVE FUNCTION untuk menghapus komentar
     *
     * @param {Array} comments - Array komentar yang akan dicari
     * @returns {Array} - Array komentar tanpa komentar yang dihapus
     */
    const deleteComment = (comments) => {
      return comments.filter((comment) => {
        // Jika ID cocok, hapus komentar ini (return false)
        if (comment.id === commentId) {
          return false;
        }
        // Jika ada replies, cari dan hapus di replies juga
        if (comment.replies) {
          comment.replies = deleteComment(comment.replies);
        }
        // Pertahankan komentar ini (return true)
        return true;
      });
    };

    // Update state dengan komentar yang sudah dihapus
    setComments(deleteComment(comments));
  };

  /**
   * FUNGSI UNTUK LIKE/UNLIKE KOMENTAR
   *
   * Alur kerja:
   * 1. Cek apakah user sudah like komentar ini
   * 2. Jika sudah like → unlike (kurangi likes, hapus dari likedBy)
   * 3. Jika belum like → like (tambah likes, tambah ke likedBy)
   * 4. Update state dengan perubahan
   *
   * @param {number} commentId - ID komentar yang akan di-like
   */
  const handleLikeComment = (commentId) => {
    /**
     * RECURSIVE FUNCTION untuk toggle like
     *
     * @param {Array} comments - Array komentar yang akan dicari
     * @returns {Array} - Array komentar dengan like yang diupdate
     */
    const toggleLike = (comments) => {
      return comments.map((comment) => {
        // Jika ID komentar cocok, toggle like
        if (comment.id === commentId) {
          // Cek apakah user sudah like komentar ini
          const isLiked = comment.likedBy?.includes(user.id);

          return {
            ...comment,
            // Toggle jumlah likes
            likes: isLiked ? comment.likes - 1 : comment.likes + 1,
            // Toggle array likedBy
            likedBy: isLiked
              ? comment.likedBy.filter((id) => id !== user.id) // Hapus user
              : [...(comment.likedBy || []), user.id], // Tambah user
          };
        }
        // Jika ada replies, cari di replies juga
        if (comment.replies) {
          return {
            ...comment,
            replies: toggleLike(comment.replies),
          };
        }
        // Jika bukan komentar yang dicari, kembalikan tanpa perubahan
        return comment;
      });
    };

    // Update state dengan like yang sudah diubah
    setComments(toggleLike(comments));
  };

  // RENDER COMPONENT - Tampilkan UI
  return (
    <div className='comment-section'>
      {/* TOGGLE BUTTON - Untuk buka/tutup comment section */}
      <div
        className='comment-toggle'
        onClick={() => setShowComments(!showComments)} // Toggle boolean
      >
        <FaRegComment />
        <span>{comments.length} Comments</span>{" "}
        {/* Tampilkan jumlah komentar */}
      </div>

      {/* CONDITIONAL RENDERING - Tampilkan content hanya jika showComments = true */}
      {showComments && (
        <div className='comment-container'>
          {/* INPUT SECTION - Untuk menulis komentar baru */}
          <div className='comment-input-section'>
            <img
              src={user.profilePicture}
              alt='avatar'
              className='comment-input-avatar'
            />
            <div className='comment-input-wrapper'>
              {/* TEXTAREA - Input untuk menulis komentar */}
              <textarea
                value={newComment} // Controlled component
                onChange={(e) => setNewComment(e.target.value)} // Update state saat ketik
                placeholder='Write a comment...'
                rows='2'
                className='comment-input'
              />
              {/* SUBMIT BUTTON - Untuk submit komentar */}
              <button
                onClick={handleAddComment} // Jalankan fungsi saat klik
                disabled={!newComment.trim()} // Disable jika kosong
                className='comment-submit'
              >
                Comment
              </button>
            </div>
          </div>

          {/* COMMENTS LIST - Daftar semua komentar */}
          <div className='comments-list'>
            {/* CONDITIONAL RENDERING - Tampilkan pesan atau daftar komentar */}
            {comments.length === 0 ? (
              // Jika tidak ada komentar
              <div className='no-comments'>
                <p>No comments yet. Be the first to comment!</p>
              </div>
            ) : (
              // Jika ada komentar, map setiap komentar ke component Comment
              comments.map((comment) => (
                <Comment
                  key={comment.id} // Key untuk React optimization
                  comment={comment} // Data komentar
                  onReply={handleReply} // Function untuk reply
                  onDelete={handleDeleteComment} // Function untuk delete
                  onLike={handleLikeComment} // Function untuk like
                  currentUser={user} // Data user saat ini
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
