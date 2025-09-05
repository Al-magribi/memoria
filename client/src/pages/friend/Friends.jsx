import React, { useState, useEffect } from "react";
import Layout from "../../components/layout/Layout";
import { FaUserFriends, FaCheck, FaTimes, FaSearch } from "react-icons/fa";
import OnlineStatus from "../../components/right/OnlineStatus";
import "../../components/right/OnlineStatus.scss";
import UserSearch from "../../components/search/UserSearch";
import {
  useGetFriendRequestsQuery,
  useGetFriendsWithOnlineStatusQuery,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
} from "../../services/api/friendship/FriendshipApi";
import "./friends.scss";
import Loading from "../../components/loading/Loading";

const Friends = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [loadingStates, setLoadingStates] = useState({});
  const [activeTab, setActiveTab] = useState("friends");

  // API hooks
  const { data: friendRequestsData, isLoading: isLoadingRequests } =
    useGetFriendRequestsQuery();
  const { data: friendsData, isLoading: isLoadingFriends } =
    useGetFriendsWithOnlineStatusQuery();
  const [acceptFriendRequest] = useAcceptFriendRequestMutation();
  const [rejectFriendRequest] = useRejectFriendRequestMutation();

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Handle friend request confirmation
  const handleConfirm = async (friendshipId) => {
    setLoadingStates((prev) => ({ ...prev, [friendshipId]: true }));

    try {
      await acceptFriendRequest(friendshipId);
      console.log(`Confirmed friend request for ID: ${friendshipId}`);
    } catch (error) {
      console.error("Error accepting friend request:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [friendshipId]: false }));
    }
  };

  // Handle friend request rejection
  const handleReject = async (friendshipId) => {
    setLoadingStates((prev) => ({ ...prev, [friendshipId]: true }));

    try {
      await rejectFriendRequest(friendshipId);
      console.log(`Rejected friend request for ID: ${friendshipId}`);
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    } finally {
      setLoadingStates((prev) => ({ ...prev, [friendshipId]: false }));
    }
  };

  // Handle friend item click (for mobile navigation)
  const handleFriendClick = (friendId) => {
    if (isMobile) {
      // Navigate to friend profile
      window.location.href = `/user/${friendId}`;
    }
  };

  if (isLoadingRequests || isLoadingFriends) {
    return <Loading />;
  }

  const friendRequests = friendRequestsData?.requests || [];
  const friends = friendsData?.friends || [];

  // Separate online and offline friends
  const onlineFriends = friends.filter((friend) => friend.isOnline);
  const offlineFriends = friends.filter((friend) => !friend.isOnline);

  return (
    <Layout>
      <div className='friends'>
        {/* Navigation Tabs */}
        <div className='friends-nav'>
          <button
            className={`nav-tab ${activeTab === "friends" ? "active" : ""}`}
            onClick={() => setActiveTab("friends")}
          >
            <FaUserFriends />
            Friends
          </button>
          <button
            className={`nav-tab ${activeTab === "search" ? "active" : ""}`}
            onClick={() => setActiveTab("search")}
          >
            <FaSearch />
            Find People
          </button>
        </div>

        {/* Content based on active tab */}
        {activeTab === "friends" && (
          <>
            {friendRequests.length > 0 && (
              <>
                <h2 className='friends-title'>
                  {isMobile ? "Friend Requests" : "Friends Requests"}
                </h2>
                <div className='friends-list'>
                  {friendRequests.map((request) => (
                    <div
                      key={request.id}
                      className='friend-item'
                      onClick={() => handleFriendClick(request.requester.id)}
                      style={{ cursor: isMobile ? "pointer" : "default" }}
                    >
                      <img
                        className='friend-avatar'
                        src={request.requester.profilePicture}
                        alt={`${request.requester.firstName} ${request.requester.lastName}`}
                        loading='lazy'
                      />
                      <div className='friend-info'>
                        <div className='friend-name'>
                          {request.requester.firstName}{" "}
                          {request.requester.lastName}
                        </div>
                        <div className='friend-mutual'>
                          <span className='mutual-icon'>
                            <FaUserFriends />
                          </span>
                          {request.mutualFriendsCount} mutual friends
                        </div>
                        <div className='friend-actions'>
                          <button
                            className='accept-btn'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleConfirm(request.id);
                            }}
                            disabled={loadingStates[request.id]}
                          >
                            {loadingStates[request.id] ? (
                              <div className='loading-spinner'></div>
                            ) : (
                              <FaCheck />
                            )}
                            Accept
                          </button>
                          <button
                            className='reject-btn'
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(request.id);
                            }}
                            disabled={loadingStates[request.id]}
                          >
                            {loadingStates[request.id] ? (
                              <div className='loading-spinner'></div>
                            ) : (
                              <FaTimes />
                            )}
                            Reject
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Online Friends Section */}
            {onlineFriends.length > 0 && (
              <>
                <h2 className='friends-title'>
                  Online Friends ({onlineFriends.length})
                </h2>
                <div className='friends-list'>
                  {onlineFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className='friend-item online'
                      onClick={() => handleFriendClick(friend.id)}
                      style={{ cursor: "pointer" }}
                    >
                      <div className='friend-avatar-container'>
                        <img
                          className='friend-avatar'
                          src={
                            friend.profilePicture ||
                            "https://via.placeholder.com/50"
                          }
                          alt={`${friend.firstName} ${friend.lastName}`}
                          loading='lazy'
                        />
                        <OnlineStatus
                          userId={friend.id}
                          isOnlineFromAPI={friend.isOnline}
                          size='small'
                        />
                      </div>
                      <div className='friend-info'>
                        <div className='friend-name'>
                          {friend.firstName} {friend.lastName}
                        </div>
                        <div className='friend-status'>Online</div>
                        <div className='friend-mutual'>
                          <span className='mutual-icon'>
                            <FaUserFriends />
                          </span>
                          {friend.mutualFriendsCount} mutual friends
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
              </>
            )}

            {/* All Friends Section */}
            <h2 className='friends-title'>All Friends ({friends.length})</h2>
            <div className='friends-list'>
              {friends.length > 0 ? (
                friends.map((friend) => (
                  <div
                    key={friend.id}
                    className={`friend-item ${
                      friend.isOnline ? "online" : "offline"
                    }`}
                    onClick={() => handleFriendClick(friend.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className='friend-avatar-container'>
                      <img
                        className='friend-avatar'
                        src={
                          friend.profilePicture ||
                          "https://via.placeholder.com/50"
                        }
                        alt={`${friend.firstName} ${friend.lastName}`}
                        loading='lazy'
                      />
                      {friend.isOnline && (
                        <OnlineStatus
                          userId={friend.id}
                          isOnlineFromAPI={friend.isOnline}
                          size='small'
                        />
                      )}
                    </div>
                    <div className='friend-info'>
                      <div className='friend-name'>
                        {friend.firstName} {friend.lastName}
                      </div>
                      <div className='friend-status'>
                        {friend.isOnline ? "Online" : "Offline"}
                      </div>
                      <div className='friend-mutual'>
                        <span className='mutual-icon'>
                          <FaUserFriends />
                        </span>
                        {friend.mutualFriendsCount} mutual friends
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
                ))
              ) : (
                <div className='no-friends'>
                  <p>No friends yet</p>
                  <p>Start connecting with people!</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "search" && <UserSearch />}
      </div>
    </Layout>
  );
};

export default Friends;
