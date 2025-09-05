import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../components/layout/Layout";
import { FaUserFriends, FaRegImages } from "react-icons/fa";
import { MdPostAdd } from "react-icons/md";
import { useSelector } from "react-redux";
import Loading from "../../components/loading/Loading";
import "./userProfile.scss";

const profilePlaceholder =
  "https://t3.ftcdn.net/jpg/05/16/27/58/360_F_516275801_f3Fsp17x6HQK0xQgDQEELoTuERO4SsWV.jpg";
const coverPhotoPlaceholder =
  "https://avitek.vn/wp-content/uploads/2020/08/Image-Placeholder-Dark.png";

const UserProfile = () => {
  const { userId } = useParams();
  const { user: currentUser } = useSelector((state) => state.user);
  const [userProfile, setUserProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/auth/profile/${userId}`, {
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setUserProfile(data);
        } else {
          console.error("Failed to fetch user profile");
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId && userId !== currentUser?.id) {
      fetchUserProfile();
    }
  }, [userId, currentUser?.id]);

  if (isLoading) {
    return (
      <Layout>
        <div className='user-profile'>
          <div className='loading-container'>
            <Loading />
          </div>
        </div>
      </Layout>
    );
  }

  if (!userProfile) {
    return (
      <Layout>
        <div className='user-profile'>
          <div className='error-container'>
            <h2>User not found</h2>
            <p>
              The user you're looking for doesn't exist or their profile is
              private.
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className='user-profile'>
        <div className='profile-content'>
          {/* Cover Photo Section */}
          <div className='cover-photo'>
            <img
              src={userProfile.coverPhoto || coverPhotoPlaceholder}
              alt='Cover'
            />

            <div className='profile-picture'>
              <img
                src={userProfile.profilePicture || profilePlaceholder}
                alt={userProfile.fullName || "Profile"}
              />
            </div>
          </div>

          {/* Profile Info Section */}
          <div className='profile-info'>
            <div className='profile-header'>
              <div className='profile-name-section'>
                <h1>{userProfile.fullName}</h1>
                <div className='username'>@{userProfile.username}</div>
                <p className='bio'>{userProfile.bio}</p>
              </div>
            </div>

            {/* Statistics */}
            <div className='profile-stats'>
              <div className='stat-item' title='Posts'>
                <MdPostAdd className='stat-icon' />
                <span>{userProfile.stats?.postsCount || 0}</span>
                <span className='stat-label'>Posts</span>
              </div>
              <div className='stat-item' title='Photos'>
                <FaRegImages className='stat-icon' />
                <span>{userProfile.stats?.photosCount || 0}</span>
                <span className='stat-label'>Photos</span>
              </div>

              <div className='stat-item' title='Friends'>
                <FaUserFriends className='stat-icon' />
                <span>{userProfile.stats?.friendsCount || 0}</span>
                <span className='stat-label'>Friends</span>
              </div>
            </div>
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
            {activeTab === "about" && (
              <div className='about-section'>
                <h3>About {userProfile.firstName}</h3>
                <div className='about-content'>
                  {userProfile.title && (
                    <div className='about-item'>
                      <strong>Title:</strong> {userProfile.title}
                    </div>
                  )}
                  {userProfile.location && (
                    <div className='about-item'>
                      <strong>Location:</strong> {userProfile.location}
                    </div>
                  )}
                  {userProfile.work && (
                    <div className='about-item'>
                      <strong>Work:</strong> {userProfile.work}
                    </div>
                  )}
                  {userProfile.education && (
                    <div className='about-item'>
                      <strong>Education:</strong> {userProfile.education}
                    </div>
                  )}
                  {userProfile.website && (
                    <div className='about-item'>
                      <strong>Website:</strong>{" "}
                      <a
                        href={userProfile.website}
                        target='_blank'
                        rel='noopener noreferrer'
                      >
                        {userProfile.website}
                      </a>
                    </div>
                  )}
                  {userProfile.bio && (
                    <div className='about-item'>
                      <strong>Bio:</strong> {userProfile.bio}
                    </div>
                  )}
                </div>
              </div>
            )}
            {activeTab === "posts" && (
              <div className='posts-section'>
                <p>Posts from {userProfile.firstName} will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default UserProfile;
