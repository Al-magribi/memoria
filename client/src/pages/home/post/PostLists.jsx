import "./postlist.scss";
import { IoIosMore } from "react-icons/io";
import { MdShare } from "react-icons/md";
import { FaRegHeart, FaRegComment } from "react-icons/fa";
import CommentSection from "../comment/CommentSection";
import { useGetFeedPostsQuery } from "../../../services/api/post/PostApi";

/**
 * POST LISTS COMPONENT
 *
 * Komponen ini bertanggung jawab untuk menampilkan daftar semua post.
 * Setiap post memiliki:
 * - Header (avatar, nama, waktu)
 * - Content (teks, gambar, video)
 * - Footer (like, share)
 * - Comment section (dengan sistem komentar lengkap)
 *
 * KONSEP DASAR:
 * - Data Dummy: Data statis untuk simulasi tanpa backend
 * - Props Drilling: Mengirim data dari parent ke child components
 * - Component Composition: Menggabungkan beberapa komponen menjadi satu
 */
const PostLists = () => {
  /**
   * DATA DUMMY - Data statis untuk simulasi
   *
   * Struktur data post:
   * - id: ID unik post
   * - content: Teks konten post
   * - image/video: Media yang ditampilkan (opsional)
   * - createdAt: Waktu pembuatan post
   * - author: Nama penulis post
   * - profilePicture: Foto profil penulis
   * - comments: Array komentar dengan struktur nested
   *
   * Struktur data komentar:
   * - id: ID unik komentar
   * - content: Isi komentar
   * - createdAt: Waktu pembuatan komentar
   * - author: Data penulis komentar
   * - likes: Jumlah likes
   * - likedBy: Array ID user yang sudah like
   * - replies: Array reply komentar (nested)
   */

  const { data, isLoading, error } = useGetFeedPostsQuery();
  console.log(data);
  const posts = [
    {
      id: 1,
      content:
        "Just had an amazing day at the beach! The sunset was absolutely breathtaking. 🌅",
      image:
        "https://images.pexels.com/photos/2668314/pexels-photo-2668314.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      createdAt: "2024-01-15",
      author: "John Doe",
      profilePicture:
        "https://images.pexels.com/photos/2092474/pexels-photo-2092474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      comments: [
        {
          id: 1,
          content: "Great post! Thanks for sharing.",
          createdAt: "2024-01-15T10:30:00Z",
          author: {
            id: 2,
            name: "Jane Smith",
            profilePicture:
              "https://images.pexels.com/photos/2128807/pexels-photo-2128807.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          },
          likes: 3,
          likedBy: [1, 3, 4], // User dengan ID 1, 3, 4 sudah like
          replies: [
            {
              id: 11,
              content: "I agree! This is really helpful.",
              createdAt: "2024-01-15T11:00:00Z",
              author: {
                id: 3,
                name: "Mike Johnson",
                profilePicture:
                  "https://images.pexels.com/photos/2598024/pexels-photo-2598024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
              },
              likes: 1,
              likedBy: [1], // Hanya user ID 1 yang like
              replies: [],
            },
          ],
        },
        {
          id: 2,
          content: "Beautiful photo! Where was this taken?",
          createdAt: "2024-01-15T12:15:00Z",
          author: {
            id: 4,
            name: "Sarah Wilson",
            profilePicture:
              "https://images.pexels.com/photos/2092474/pexels-photo-2092474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          },
          likes: 2,
          likedBy: [1, 2], // User ID 1 dan 2 sudah like
          replies: [],
        },
        {
          id: 3,
          content: "The colors are stunning! What camera did you use?",
          createdAt: "2024-01-15T14:20:00Z",
          author: {
            id: 5,
            name: "Alex Chen",
            profilePicture:
              "https://images.pexels.com/photos/2598024/pexels-photo-2598024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          },
          likes: 0,
          likedBy: [], // Belum ada yang like
          replies: [],
        },
      ],
    },
    {
      id: 2,
      content:
        "Just finished reading an incredible book! 'The Midnight Library' by Matt Haig. Highly recommend it to everyone! 📚",
      image:
        "https://images.pexels.com/photos/592077/pexels-photo-592077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      createdAt: "2024-01-14",
      author: "Emma Davis",
      profilePicture:
        "https://images.pexels.com/photos/2128807/pexels-photo-2128807.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      comments: [
        {
          id: 4,
          content: "I've been meaning to read that! How was it?",
          createdAt: "2024-01-14T16:45:00Z",
          author: {
            id: 1,
            name: "Current User", // Komentar dari user yang sedang login
            profilePicture:
              "https://images.pexels.com/photos/2092474/pexels-photo-2092474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          },
          likes: 1,
          likedBy: [2], // Hanya author post yang like
          replies: [
            {
              id: 12,
              content:
                "It was absolutely mind-blowing! You should definitely give it a try.",
              createdAt: "2024-01-14T17:30:00Z",
              author: {
                id: 2,
                name: "Emma Davis", // Reply dari author post
                profilePicture:
                  "https://images.pexels.com/photos/2128807/pexels-photo-2128807.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
              },
              likes: 2,
              likedBy: [1, 3], // User ID 1 dan 3 sudah like
              replies: [],
            },
          ],
        },
      ],
    },
    {
      id: 3,
      content:
        "Coffee and coding - the perfect combination for a productive morning! ☕💻",
      image:
        "https://images.pexels.com/photos/2093323/pexels-photo-2093323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      createdAt: "2024-01-13",
      author: "David Kim",
      profilePicture:
        "https://images.pexels.com/photos/2598024/pexels-photo-2598024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      comments: [
        {
          id: 5,
          content: "What are you working on today?",
          createdAt: "2024-01-13T09:15:00Z",
          author: {
            id: 1,
            name: "Current User", // Komentar dari user yang sedang login
            profilePicture:
              "https://images.pexels.com/photos/2092474/pexels-photo-2092474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          },
          likes: 0,
          likedBy: [], // Belum ada yang like
          replies: [],
        },
        {
          id: 6,
          content: "Love the setup! What's your favorite coffee?",
          createdAt: "2024-01-13T10:30:00Z",
          author: {
            id: 4,
            name: "Sarah Wilson",
            profilePicture:
              "https://images.pexels.com/photos/2092474/pexels-photo-2092474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          },
          likes: 1,
          likedBy: [3], // Hanya author post yang like
          replies: [],
        },
      ],
    },
    {
      id: 4,
      content:
        "Just uploaded a new tutorial on React hooks! Check it out if you're learning React 🚀",
      video:
        "https://videos.pexels.com/video-files/4063585/4063585-hd_1920_1080_30fps.mp4",
      createdAt: "2024-01-12",
      author: "Lisa Park",
      profilePicture:
        "https://images.pexels.com/photos/2598024/pexels-photo-2598024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      comments: [
        {
          id: 7,
          content: "This is exactly what I needed! Thank you so much!",
          createdAt: "2024-01-12T15:20:00Z",
          author: {
            id: 1,
            name: "Current User", // Komentar dari user yang sedang login
            profilePicture:
              "https://images.pexels.com/photos/2092474/pexels-photo-2092474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          },
          likes: 3,
          likedBy: [4, 5, 2], // User ID 4, 5, dan 2 sudah like
          replies: [],
        },
        {
          id: 8,
          content: "Great tutorial! Very clear explanations.",
          createdAt: "2024-01-12T16:45:00Z",
          author: {
            id: 3,
            name: "Mike Johnson",
            profilePicture:
              "https://images.pexels.com/photos/2598024/pexels-photo-2598024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
          },
          likes: 1,
          likedBy: [4], // Hanya author post yang like
          replies: [],
        },
      ],
    },
  ];

  /**
   * CURRENT USER DATA - Data user yang sedang login
   *
   * Digunakan untuk:
   * - Menentukan apakah user bisa hapus komentar
   * - Tracking like status komentar
   * - Menampilkan avatar di form komentar
   */
  const currentUser = {
    id: 1,
    name: "Current User",
    profilePicture:
      "https://images.pexels.com/photos/2092474/pexels-photo-2092474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  };

  // RENDER COMPONENT - Tampilkan daftar post
  return (
    <div className='d-flex flex-column'>
      {/* MAP SETIAP POST - Render setiap post dalam array */}
      {posts.map((post) => (
        <div className='post-list' key={post.id}>
          {/* POST HEADER - Bagian atas post (avatar, nama, waktu) */}
          <div className='post-list-header'>
            <div className='post-list-header-left'>
              {/* AVATAR - Foto profil penulis post */}
              <img src={post.profilePicture} alt='avatar' />

              {/* POST INFO - Nama penulis dan waktu */}
              <div className='post-list-header-info'>
                <span className='post-list-header-info-name'>
                  {post.author}
                </span>
                <span className='post-list-header-info-time'>
                  {post.createdAt}
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

            {/* POST IMAGE - Gambar post (conditional rendering) */}
            {post.image && (
              <div className='post-list-content-image'>
                <img src={post.image} alt='content' />
              </div>
            )}

            {/* POST VIDEO - Video post (conditional rendering) */}
            {post.video && (
              <div className='post-list-content-video'>
                <video src={post.video} controls />
              </div>
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
            postId={post.id} // ID post untuk identifikasi
            comments={post.comments} // Array komentar post ini
            currentUser={currentUser} // Data user yang sedang login
          />
        </div>
      ))}
    </div>
  );
};

export default PostLists;
