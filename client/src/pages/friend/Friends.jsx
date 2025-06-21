import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { FaUserFriends, FaCheck, FaTimes } from "react-icons/fa";
import "./friends.scss";

const dummyMutualAvatars = [
  "https://randomuser.me/api/portraits/women/1.jpg",
  "https://randomuser.me/api/portraits/men/2.jpg",
  "https://randomuser.me/api/portraits/women/3.jpg",
];

const Friends = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const dummyFriends = [
    {
      id: 1,
      name: "Savta Komalaria",
      mutual: 5,
      profilePicture: "https://randomuser.me/api/portraits/women/44.jpg",
    },
    {
      id: 2,
      name: "Muhammad Zain Maulana",
      mutual: 67,
      profilePicture: "https://randomuser.me/api/portraits/men/45.jpg",
    },
    {
      id: 3,
      name: "Mohamad Farhan",
      mutual: 2,
      profilePicture: "https://randomuser.me/api/portraits/men/46.jpg",
    },
    {
      id: 4,
      name: "Khairul Umam",
      mutual: 0,
      profilePicture: "https://randomuser.me/api/portraits/men/47.jpg",
    },
    {
      id: 5,
      name: "Nur Azizah",
      mutual: 7,
      profilePicture: "https://randomuser.me/api/portraits/women/48.jpg",
    },
    {
      id: 6,
      name: "Rahmat Akbar",
      mutual: 25,
      profilePicture: "https://randomuser.me/api/portraits/men/49.jpg",
    },
  ];

  // Handle friend request confirmation
  const handleConfirm = async (friendId) => {
    setLoadingStates((prev) => ({ ...prev, [friendId]: true }));

    // Simulate API call
    setTimeout(() => {
      console.log(`Confirmed friend request for ID: ${friendId}`);
      setLoadingStates((prev) => ({ ...prev, [friendId]: false }));
      // TODO: Update UI to move friend from requests to friends list
    }, 1000);
  };

  // Handle friend request deletion
  const handleDelete = async (friendId) => {
    setLoadingStates((prev) => ({ ...prev, [friendId]: true }));

    // Simulate API call
    setTimeout(() => {
      console.log(`Deleted friend request for ID: ${friendId}`);
      setLoadingStates((prev) => ({ ...prev, [friendId]: false }));
      // TODO: Remove friend from requests list
    }, 1000);
  };

  // Handle friend item click (for mobile navigation)
  const handleFriendClick = (friendId) => {
    if (isMobile) {
      // TODO: Navigate to friend profile or open friend details modal
      console.log(`Navigated to friend profile: ${friendId}`);
    }
  };

  return (
    <Layout>
      <div className="friends">
        <h2 className="friends-title">
          {isMobile ? "Friend Requests" : "Friends Requests"}
        </h2>
        <div className="friends-list">
          {dummyFriends.map((friend, idx) => (
            <div
              key={friend.id}
              className="friend-item"
              onClick={() => handleFriendClick(friend.id)}
              style={{ cursor: isMobile ? "pointer" : "default" }}
            >
              <img
                className="friend-avatar"
                src={friend.profilePicture}
                alt={friend.name}
                loading="lazy"
              />
              <div className="friend-info">
                <div className="friend-name">{friend.name}</div>
                <div className="friend-mutual">
                  <span className="mutual-icon">
                    <FaUserFriends />
                  </span>
                  {friend.mutual} mutual friends
                  <span className="mutual-avatars">
                    {dummyMutualAvatars
                      .slice(0, Math.min(friend.mutual, 3))
                      .map((av, i) => (
                        <img src={av} alt="mutual" key={i} />
                      ))}
                  </span>
                </div>

                <div className="friend-actions">
                  <button
                    className="btn-confirm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleConfirm(friend.id);
                    }}
                    disabled={loadingStates[friend.id]}
                    aria-label={`Confirm ${friend.name}'s friend request`}
                  >
                    {loadingStates[friend.id] ? (
                      <span>Confirming...</span>
                    ) : (
                      <>
                        {isMobile && <FaCheck style={{ marginRight: "4px" }} />}
                        Confirm
                      </>
                    )}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(friend.id);
                    }}
                    disabled={loadingStates[friend.id]}
                    aria-label={`Delete ${friend.name}'s friend request`}
                  >
                    {loadingStates[friend.id] ? (
                      <span>Deleting...</span>
                    ) : (
                      <>
                        {isMobile && <FaTimes style={{ marginRight: "4px" }} />}
                        Delete
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <h2 className="friends-title">Friends</h2>
        <div className="friends-list">
          {dummyFriends?.map((friend) => (
            <div
              key={friend.id}
              className="friend-item"
              onClick={() => handleFriendClick(friend.id)}
              style={{ cursor: "pointer" }}
            >
              <img
                className="friend-avatar"
                src={friend.profilePicture}
                alt={friend.name}
                loading="lazy" // Better performance on mobile
              />
              <div className="friend-info">
                <div className="friend-name">{friend.name}</div>
                <div className="friend-mutual">
                  <span className="mutual-icon">
                    <FaUserFriends />
                  </span>
                  {friend.mutual} mutual friends
                </div>
                {isMobile && (
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#65676b",
                      marginTop: "0.5rem",
                      fontStyle: "italic",
                    }}
                  >
                    Tap to view profile
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Friends;
