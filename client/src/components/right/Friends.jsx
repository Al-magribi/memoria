import React from "react";
import { FaRegCommentDots } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useGetFriendsWithOnlineStatusQuery } from "../../services/api/friendship/FriendshipApi";
import OnlineStatus from "./OnlineStatus";
import "./OnlineStatus.scss";

const Friends = () => {
  const navigate = useNavigate();

  // Get friends with online status from API
  const {
    data: friendsData,
    isLoading,
    error,
  } = useGetFriendsWithOnlineStatusQuery();

  const friends = friendsData?.friends || [];

  const handleChat = (friendId, name) => {
    const formattedName = name.replace(/\s+/g, "").toLowerCase();
    navigate(`/message?friendId=${friendId}&name=${formattedName}`);
  };

  if (isLoading) {
    return (
      <div className='friends-chat-list-wrapper'>
        <p className='friends-chat-title'>Online Friends</p>
        <div className='friends-chat-list'>
          <div style={{ textAlign: "center", padding: "1rem" }}>Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='friends-chat-list-wrapper'>
        <p className='friends-chat-title'>Online Friends</p>
        <div className='friends-chat-list'>
          <div style={{ textAlign: "center", padding: "1rem", color: "#666" }}>
            Failed to load friends
          </div>
        </div>
      </div>
    );
  }

  // Filter to show only online friends
  const onlineFriends = friends.filter((friend) => friend.isOnline);

  return (
    <div className='friends-chat-list-wrapper'>
      <p className='friends-chat-title'>
        Online Friends ({onlineFriends.length})
      </p>
      <div className='friends-chat-list'>
        {onlineFriends.length > 0 ? (
          onlineFriends.map((friend) => (
            <div
              key={friend.id}
              className='friend-chat-item'
              onClick={() =>
                handleChat(friend.id, `${friend.firstName} ${friend.lastName}`)
              }
            >
              <div className='friend-chat-image'>
                <div className='avatar-online'>
                  <img
                    src={
                      friend.profilePicture || "https://via.placeholder.com/40"
                    }
                    alt={`${friend.firstName} ${friend.lastName}`}
                  />
                  <OnlineStatus
                    userId={friend.id}
                    isOnlineFromAPI={friend.isOnline}
                    size='small'
                  />
                </div>
                <p>
                  {friend.firstName} {friend.lastName}
                </p>
              </div>
              <button className='chat-icon-btn' title='Chat' type='button'>
                <FaRegCommentDots size={18} />
              </button>
            </div>
          ))
        ) : (
          <div style={{ textAlign: "center", padding: "1rem", color: "#666" }}>
            No friends online
          </div>
        )}
      </div>
    </div>
  );
};

export default Friends;
