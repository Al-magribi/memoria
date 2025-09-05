import { useState, useRef } from "react";
import Layout from "../../components/layout/Layout";
import "./profile.scss";
import About from "./About";
import Posts from "./Posts";
import { FaCloudUploadAlt, FaUserFriends, FaRegImages } from "react-icons/fa";
import { MdPostAdd } from "react-icons/md";
import { useSelector } from "react-redux";
import {
  useUploadProfilePictureMutation,
  useUploadCoverPhotoMutation,
  useGetUserStatsQuery,
  useGetUserPostCountQuery,
} from "../../services/api/user/UserApi";
import Loading from "../../components/loading/Loading";

const PhotoPlaceholder =
  "https://avitek.vn/wp-content/uploads/2020/08/Image-Placeholder-Dark.png";

const Profile = () => {
  const { user } = useSelector((state) => state.user);

  // Ambil statistik user dan jumlah post
  const { data: statsData, isLoading: statsLoading } = useGetUserStatsQuery(
    user?.id,
    { skip: !user?.id }
  );
  const { data: postCountData, isLoading: postCountLoading } =
    useGetUserPostCountQuery(user?.id, { skip: !user?.id });

  const [activeTab, setActiveTab] = useState("about");
  const [uploadProfilePicture, { isLoading: isProfileLoading }] =
    useUploadProfilePictureMutation();
  const [uploadCoverPhoto, { isLoading: isCoverLoading }] =
    useUploadCoverPhotoMutation();

  const coverPhotoInputRef = useRef(null);
  const profilePictureInputRef = useRef(null);

  const handleImageUpload = async (type, file) => {
    if (file) {
      try {
        const userId = user?.id;
        if (type === "profilePicture") {
          uploadProfilePicture({ userId, file });
        } else if (type === "coverPhoto") {
          uploadCoverPhoto({ userId, file });
        }
      } catch (error) {
        console.error("Error uploading image:", error);
      }
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
      {(isProfileLoading || isCoverLoading) && (
        <div className='profile-loading-overlay'>
          <Loading />
        </div>
      )}
      <div className='profile flex-2'>
        <div className='profile-content'>
          {/* Cover Photo Section */}
          <div className='cover-photo'>
            <img
              src={user?.coverPhoto || PhotoPlaceholder}
              alt='Cover'
              loading='lazy'
            />
            <div
              className='cover-photo-overlay'
              onClick={triggerCoverPhotoUpload}
            >
              <div className='upload-icon'>
                <FaCloudUploadAlt />
              </div>
              <span>Change Cover Photo</span>
            </div>
            <input
              ref={coverPhotoInputRef}
              type='file'
              accept='image/*'
              onChange={handleCoverPhotoChange}
              style={{ display: "none" }}
            />

            <div className='profile-picture'>
              <img
                src={user?.profilePicture || PhotoPlaceholder}
                alt={user?.fullName || "Profile"}
                loading='lazy'
              />
              <div
                className='profile-picture-overlay'
                onClick={triggerProfilePictureUpload}
              >
                <div className='upload-icon'>
                  <FaCloudUploadAlt />
                </div>
              </div>
              <input
                ref={profilePictureInputRef}
                type='file'
                accept='image/*'
                onChange={handleProfilePictureChange}
                style={{ display: "none" }}
              />
            </div>
          </div>

          {/* Profile Info Section */}
          <div className='profile-info'>
            <div className='profile-header'>
              <div className='profile-name-section'>
                <h1>{user?.fullName}</h1>
                <div className='username'>@{user?.username}</div>
                <p className='bio'>{user?.bio}</p>
              </div>
            </div>

            {/* Statistik */}
            {statsLoading || postCountLoading ? (
              <div className='profile-stats loading'>Loading statistics...</div>
            ) : (
              <div className='profile-stats'>
                <div className='stat-item' title='Posts'>
                  <MdPostAdd className='stat-icon' />
                  <span>
                    {statsData?.stats?.postsCount ??
                      postCountData?.postsCount ??
                      0}
                  </span>
                  <span className='stat-label'>Posts</span>
                </div>
                <div className='stat-item' title='Photos'>
                  <FaRegImages className='stat-icon' />
                  <span>{statsData?.stats?.photosCount ?? 0}</span>
                  <span className='stat-label'>Photos</span>
                </div>

                <div className='stat-item' title='Friends'>
                  <FaUserFriends className='stat-icon' />
                  <span>{statsData?.stats?.friendsCount ?? 0}</span>
                  <span className='stat-label'>Friends</span>
                </div>
              </div>
            )}
          </div>

          {/* Profile Navigation */}
          <div className='profile-nav'>
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
          <div className='profile-main'>
            {activeTab === "about" && <About user={user} />}
            {activeTab === "posts" && <Posts />}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
