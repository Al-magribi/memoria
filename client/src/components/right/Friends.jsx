import React from "react";
import { FaRegCommentDots } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Friends = () => {
  const navigate = useNavigate();
  const friends = [
    {
      id: 1,
      name: "John Doe",
      profilePicture:
        "https://images.pexels.com/photos/2379005/pexels-photo-2379005.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      id: 2,
      name: "Jane Smith",
      profilePicture:
        "https://images.pexels.com/photos/2218786/pexels-photo-2218786.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      id: 3,
      name: "Michael Lee",
      profilePicture:
        "https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      id: 4,
      name: "Emily Clark",
      profilePicture:
        "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      id: 5,
      name: "Chris Evans",
      profilePicture:
        "https://images.pexels.com/photos/2787341/pexels-photo-2787341.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
    {
      id: 6,
      name: "Sophia Turner",
      profilePicture:
        "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
    },
  ];

  const handleChat = (friendId, name) => {
    const formattedName = name.replace(/\s+/g, "").toLowerCase();

    navigate(`/message?friendId=${friendId}&name=${formattedName}`);
  };

  return (
    <div className="friends-chat-list-wrapper">
      <p className="friends-chat-title">Online Friends</p>
      <div className="friends-chat-list">
        {friends?.map((friend) => (
          <div
            key={friend.id}
            className="friend-chat-item"
            onClick={() => handleChat(friend.id, friend.name)}
          >
            <div className="friend-chat-image">
              <div className="avatar-online">
                <img src={friend.profilePicture} alt={friend.name} />
                <span className="online-dot" />
              </div>
              <p>{friend.name}</p>
            </div>
            <button className="chat-icon-btn" title="Chat" type="button">
              <FaRegCommentDots size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Friends;
