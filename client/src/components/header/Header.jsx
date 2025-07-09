import * as Fa from "react-icons/fa";
import { useDarkMode } from "../../context/DarkModeContext";
import Notif from "./Notif";
import Request from "./Request";
import "./header.scss";
import { useEffect, useState } from "react";
import { leftBarMenus } from "../left/LeftBar";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetUnreadCountQuery } from "../../services/api/notification/NotificationApi";
import { useGetFriendRequestsQuery } from "../../services/api/friendship/FriendshipApi";
import { useGetChatsQuery } from "../../services/api/chat/chatApi";
import { useSocket } from "../../context/SocketContext";

const MobileMenu = ({ onClose, handleClick, user, unreadChatCount }) => (
  <div className='mobile-menu-panel' onClick={(e) => e.stopPropagation()}>
    <div className='mobile-menu-header'>
      <span>Menu</span>
      <button onClick={onClose}>
        <Fa.FaTimes />
      </button>
    </div>

    <div className='profile-section'>
      <div className='profile-header'>
        <img src={user?.profilePicture} alt='user' />
        <div className='profile-info'>
          <h3>{user?.fullName}</h3>
          <span className='profile-title'>{user?.bio}</span>
        </div>
      </div>
    </div>

    <div className='mobile-menu-list'>
      {leftBarMenus.map((item, idx) => (
        <div
          className='mobile-menu-item'
          key={idx}
          onClick={() => handleClick(item)}
        >
          <span className='mobile-menu-icon'>{item.icon}</span>
          <span>{item.label}</span>
          {item.label === "Message" && unreadChatCount > 0 && (
            <span className='mobile-badge'>
              {unreadChatCount > 99 ? "99+" : unreadChatCount}
            </span>
          )}
        </div>
      ))}
    </div>
  </div>
);

const Header = () => {
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  const { user, isSignin } = useSelector((state) => state.user);

  // Get unread notification count
  const { data: unreadData } = useGetUnreadCountQuery();
  const unreadCount = unreadData?.unreadCount || 0;

  // Get friend request count
  const { data: friendRequestsData } = useGetFriendRequestsQuery();
  const friendRequestCount = friendRequestsData?.requests?.length || 0;

  // Get chats data to calculate unread count
  const { data: chatsData, refetch: refetchChats } = useGetChatsQuery();
  const { socket } = useSocket();

  const isMobile = window.innerWidth <= 1024;

  // Calculate total unread messages from all chats
  useEffect(() => {
    if (chatsData) {
      const totalUnread = chatsData.reduce(
        (total, chat) => total + (chat.unread || 0),
        0
      );
      setUnreadChatCount(totalUnread);
    }
  }, [chatsData]);

  // Listen for real-time chat updates
  useEffect(() => {
    if (!socket) return;

    // Listen for new messages
    const handleNewMessage = (data) => {
      // Refetch chats to get updated unread counts
      refetchChats();
    };

    // Listen for chat updates (when other user sends message)
    const handleChatUpdated = (data) => {
      // Refetch chats to get updated unread counts
      refetchChats();
    };

    // Listen for messages being read
    const handleMessagesRead = (data) => {
      // Refetch chats to get updated unread counts
      refetchChats();
    };

    socket.on("newMessage", handleNewMessage);
    socket.on("chatUpdated", handleChatUpdated);
    socket.on("messagesRead", handleMessagesRead);

    return () => {
      socket.off("newMessage", handleNewMessage);
      socket.off("chatUpdated", handleChatUpdated);
      socket.off("messagesRead", handleMessagesRead);
    };
  }, [socket, refetchChats]);

  const handleClick = (menu) => {
    navigate(menu.path);
    setMenuOpen(false);
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isSignin || !user?.id || Object.keys(user).length === 0) {
        navigate("/signin");
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [user, isSignin, navigate]);

  return (
    <div className='header'>
      <div className='header-container'>
        <div className='header-left'>
          <div className='brand'>
            <Fa.FaCode className='brand-icon' />
            <h1>Memoria</h1>
          </div>
        </div>

        <div className='header-center'>
          <div className='search-container'>
            <Fa.FaSearch className='search-icon' />
            <input
              type='text'
              placeholder='Cari proyek, koneksi, atau konten...'
            />
          </div>
        </div>

        <div className='header-right'>
          <div className='user-actions'>
            <button
              className={`theme-toggle ${isDark ? "dark" : "light"}`}
              onClick={toggleDarkMode}
            >
              {isDark ? <Fa.FaSun /> : <Fa.FaMoon />}
            </button>

            {!isMobile && (
              <div className='notification-btn icon-btn'>
                <Fa.FaBell />
                {unreadCount > 0 && (
                  <span className='notification-badge'>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
                <Notif />
              </div>
            )}

            {isMobile ? (
              <button
                className='menu-btn icon-btn'
                onClick={() => setMenuOpen(true)}
              >
                <Fa.FaBars />
              </button>
            ) : (
              <div className='message-btn icon-btn'>
                <Fa.FaUser />
                {friendRequestCount > 0 && (
                  <span className='message-badge'>
                    {friendRequestCount > 99 ? "99+" : friendRequestCount}
                  </span>
                )}
                <Request />
              </div>
            )}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          className='mobile-menu-backdrop'
          onClick={() => setMenuOpen(false)}
        >
          <MobileMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            handleClick={handleClick}
            user={user}
            unreadChatCount={unreadChatCount}
          />
        </div>
      )}
    </div>
  );
};

export default Header;
