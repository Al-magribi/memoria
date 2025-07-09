import React, { useEffect, useState } from "react";
import * as Fa from "react-icons/fa";
import "./leftbar.scss";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { setLogout } from "../../services/api/user/UserSlice";
import { useLogoutMutation } from "../../services/api/user/UserApi";
import { useGetChatsQuery } from "../../services/api/chat/chatApi";
import { useSocket } from "../../context/SocketContext";
import { toast } from "react-toastify";
import Loading from "../loading/Loading";

const coverPhotoPlaceholder =
  "https://avitek.vn/wp-content/uploads/2020/08/Image-Placeholder-Dark.png";

export const leftBarMenus = [
  { icon: <Fa.FaHome />, label: "Home", path: "/" },
  { icon: <Fa.FaUser />, label: "Profile", path: "/profile" },
  { icon: <Fa.FaUsers />, label: "Friends", path: "/friends" },
  { icon: <Fa.FaFacebookMessenger />, label: "Message", path: "/message" },
  { icon: <Fa.FaCog />, label: "Setting", path: "/setting" },
];

const LeftBar = () => {
  const navigate = useNavigate();
  const pathname = useLocation().pathname;
  const dispatch = useDispatch();
  const [unreadCount, setUnreadCount] = useState(0);

  const { user } = useSelector((state) => state.user);
  const [logout, { isLoading, isSuccess, data, error }] = useLogoutMutation();

  // Get chats data to calculate unread count
  const { data: chatsData, refetch: refetchChats } = useGetChatsQuery();
  const { socket } = useSocket();

  const handleLogout = async () => {
    logout();
    dispatch(setLogout());
  };

  // Calculate total unread messages from all chats
  useEffect(() => {
    if (chatsData) {
      const totalUnread = chatsData.reduce(
        (total, chat) => total + (chat.unread || 0),
        0
      );
      setUnreadCount(totalUnread);
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

  useEffect(() => {
    if (isSuccess) {
      navigate("/signin");
      toast.success(data?.message);
    }

    if (error) {
      toast.error(error?.data?.message);
    }
  }, [isSuccess, data, error]);

  // Hanya render di desktop
  if (window.innerWidth <= 1024) return null;

  if (isLoading) return <Loading />;

  return (
    <div className='flex-1 left-bar'>
      <div className='left-container'>
        {/* Profile Section */}
        <div className='profile-section'>
          <div className='profile-header'>
            <img
              src={user?.profilePicture || coverPhotoPlaceholder}
              alt='user'
              loading='lazy'
            />
            <div className='profile-info'>
              <h3>{user?.fullName}</h3>
              <span className='profile-title' title={user?.bio}>
                {user?.bio?.length > 15
                  ? user?.bio?.slice(0, 15) + "..."
                  : user?.bio}
              </span>
            </div>
          </div>
        </div>

        {/* Main Menu */}
        <div className='menu-section'>
          <ul className='left-menu'>
            <li
              className={`menu-item ${pathname === "/" ? "active" : ""}`}
              onClick={() => navigate("/")}
            >
              <Fa.FaHome className='menu-icon' />
              <span>Home</span>
            </li>
            <li
              className={`menu-item ${pathname === "/profile" ? "active" : ""}`}
              onClick={() => navigate("/profile")}
            >
              <Fa.FaUser className='menu-icon' />
              <span>Profile</span>
            </li>
            <li
              className={`menu-item ${pathname === "/friends" ? "active" : ""}`}
              onClick={() => navigate("/friends")}
            >
              <Fa.FaUserFriends className='menu-icon' />
              <span>Friends</span>
            </li>
            <li
              className={`menu-item ${pathname === "/message" ? "active" : ""}`}
              onClick={() => navigate("/message")}
            >
              <Fa.FaFacebookMessenger className='menu-icon' />
              <span>Message</span>
              {unreadCount > 0 && (
                <span className='badge'>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </li>
            <li
              className={`menu-item ${pathname === "/setting" ? "active" : ""}`}
              onClick={() => navigate("/setting")}
            >
              <Fa.FaCog className='menu-icon' />
              <span>Setting</span>
            </li>
            <li
              className='menu-item'
              onClick={handleLogout}
              disabled={isLoading}
            >
              <Fa.FaSignOutAlt className='menu-icon' />
              <span>Logout</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LeftBar;
