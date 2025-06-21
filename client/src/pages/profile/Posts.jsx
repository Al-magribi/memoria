import { MdShare } from "react-icons/md";
import { FaRegHeart, FaRegComment } from "react-icons/fa";

const Posts = () => {
  const posts = [
    {
      id: 1,
      content: "Hello, world!",
      image:
        "https://images.pexels.com/photos/2668314/pexels-photo-2668314.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      createdAt: "2021-01-01",
      author: "John Doe",
      profilePicture:
        "https://images.pexels.com/photos/2092474/pexels-photo-2092474.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      id: 2,
      content: "Hello, world!",
      image:
        "https://images.pexels.com/photos/592077/pexels-photo-592077.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      createdAt: "2021-01-01",
      author: "John Doe",
      profilePicture:
        "https://images.pexels.com/photos/2128807/pexels-photo-2128807.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      id: 3,
      content: "Hello, world!",
      image:
        "https://images.pexels.com/photos/2093323/pexels-photo-2093323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      createdAt: "2021-01-01",
      author: "John Doe",
      profilePicture:
        "https://images.pexels.com/photos/2598024/pexels-photo-2598024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      id: 4,
      content: "Hello, world!",
      video:
        "https://videos.pexels.com/video-files/4063585/4063585-hd_1920_1080_30fps.mp4",
      createdAt: "2021-01-01",
      author: "John Doe",
      profilePicture:
        "https://images.pexels.com/photos/2598024/pexels-photo-2598024.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
  ];

  return (
    <div className="profile-post-list-container">
      {posts.map((post) => (
        <div className="profile-post-list" key={post.id}>
          <div className="profile-post-list-header">
            <div className="profile-post-list-header-left">
              <img src={post.profilePicture} alt="avatar" />
              <div className="profile-post-list-header-info">
                <span className="profile-post-list-header-info-name">
                  {post.author}
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

            {post.image && (
              <div className="profile-post-list-content-image">
                <img src={post.image} alt="content" />
              </div>
            )}
            {post.video && (
              <div className="profile-post-list-content-video">
                <video src={post.video} controls />
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
      ))}
    </div>
  );
};

export default Posts;
