import { useState, useRef } from "react";
import Layout from "../../components/layout/Layout";
import "./profile.scss";
import About from "./About";
import Posts from "./Posts";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useSelector } from "react-redux";

const profilePlaceholder =
  "https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg";

const coverPhotoPlaceholder =
  "https://avitek.vn/wp-content/uploads/2020/08/Image-Placeholder-Dark.png";

const Profile = () => {
  const { user } = useSelector((state) => state.user);
  const [activeTab, setActiveTab] = useState("about");

  const coverPhotoInputRef = useRef(null);
  const profilePictureInputRef = useRef(null);

  const handleImageUpload = (type, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target.result;
        setUser((prev) => ({
          ...prev,
          [type]: imageUrl,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload("coverPhoto", file);
    }
  };

  const handleProfilePictureChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      handleImageUpload("profilePicture", file);
    }
  };

  const triggerCoverPhotoUpload = () => {
    coverPhotoInputRef.current?.click();
  };

  const triggerProfilePictureUpload = () => {
    profilePictureInputRef.current?.click();
  };

  return (
    <Layout>
      <div className="profile flex-2">
        <div className="profile-content">
          {/* Cover Photo Section */}
          <div className="cover-photo">
            <img src={user?.coverPhoto || coverPhotoPlaceholder} alt="Cover" />
            <div
              className="cover-photo-overlay"
              onClick={triggerCoverPhotoUpload}
            >
              <div className="upload-icon">
                <FaCloudUploadAlt />
              </div>
              <span>Change Cover Photo</span>
            </div>
            <input
              ref={coverPhotoInputRef}
              type="file"
              accept="image/*"
              onChange={handleCoverPhotoChange}
              style={{ display: "none" }}
            />

            <div className="profile-picture">
              <img
                src={user?.profilePicture || profilePlaceholder}
                alt={user?.name}
              />
              <div
                className="profile-picture-overlay"
                onClick={triggerProfilePictureUpload}
              >
                <div className="upload-icon">
                  <FaCloudUploadAlt />
                </div>
              </div>
              <input
                ref={profilePictureInputRef}
                type="file"
                accept="image/*"
                onChange={handleProfilePictureChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

          {/* Profile Info Section */}
          <div className="profile-info">
            <h1>{user?.name}</h1>
            <p className="bio">{user?.bio}</p>
            <div className="stats">
              <div className="stat-item">
                <span className="count">{user?.friends}</span>
                <span className="label">Friends</span>
              </div>

              <div className="stat-item">
                <span className="count">{user?.posts}</span>
                <span className="label">Posts</span>
              </div>
            </div>
          </div>

          {/* Profile Navigation */}
          <div className="profile-nav">
            <button
              className={`nav-item ${activeTab === "about" ? "active" : ""}`}
              onClick={() => setActiveTab("about")}
            >
              About
            </button>
            <button
              className={`nav-item ${activeTab === "posts" ? "active" : ""}`}
              onClick={() => setActiveTab("posts")}
            >
              Posts
            </button>
          </div>

          {/* Main Content Area */}
          <div className="profile-main">
            {activeTab === "about" && <About user={user} />}
            {activeTab === "posts" && <Posts />}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
