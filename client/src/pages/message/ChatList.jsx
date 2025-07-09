import React from "react";
import { IoCheckmarkDone } from "react-icons/io5";

const ChatList = ({
  chats = [],
  filteredFriends = [],
  searchQuery = "",
  onSearchChange,
  onSearchFocus,
  onSearchBlur,
  onFriendSelect,
  onChatSelect,
  selectedChat,
  showSearchResults,
  onlineUsers = new Set(),
}) => {
  return (
    <div className='chat-list'>
      <div className='chat-list-header'>
        <h2>Messages</h2>
        <div className='search-box'>
          <input
            type='text'
            placeholder='Search friends...'
            value={searchQuery}
            onChange={onSearchChange}
            onFocus={onSearchFocus}
            onBlur={onSearchBlur}
          />
        </div>
      </div>
      <div className='chat-items'>
        {showSearchResults && searchQuery ? (
          filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <div
                key={friend.id}
                className='chat-item search-result'
                onClick={() => onFriendSelect(friend)}
              >
                <div className='chat-avatar'>
                  <img
                    src={friend.profilePicture || "/profiles/user.jpg"}
                    alt={friend.username}
                  />
                  {onlineUsers.has(friend.id) && (
                    <div className='online-indicator'></div>
                  )}
                </div>
                <div className='chat-info'>
                  <div className='chat-header'>
                    <h4>{friend.username}</h4>
                  </div>
                  <div className='chat-preview'>
                    <p>
                      {friend.firstName} {friend.lastName}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className='no-search-results'>
              <p>No friends found matching "{searchQuery}"</p>
            </div>
          )
        ) : (
          chats.map((chat) => (
            <div
              key={chat.id}
              className={`chat-item ${
                selectedChat?.id === chat.id ? "active" : ""
              }`}
              onClick={() => onChatSelect(chat)}
            >
              <div className='chat-avatar'>
                <img src={chat.avatar} alt={chat.name} />
                {onlineUsers.has(chat.participantId) && (
                  <div className='online-indicator'></div>
                )}
              </div>
              <div className='chat-info'>
                <div className='chat-header'>
                  <h4>{chat.name}</h4>
                  <span className='chat-time'>{chat.time}</span>
                </div>
                <div className='chat-preview'>
                  <p>{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <div className='unread-badge'>{chat.unread}</div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
