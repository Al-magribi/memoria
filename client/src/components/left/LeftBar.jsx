import React from "react";
import * as Fa from "react-icons/fa";
import "./leftbar.scss";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

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

  const { user } = useSelector((state) => state.user);

  // Hanya render di desktop
  if (window.innerWidth <= 1024) return null;

  return (
    <div className='flex-1 left-bar'>
      <div className='left-container'>
        {/* Profile Section */}
        <div className='profile-section'>
          <div className='profile-header'>
            <img src={user?.profilePicture} alt='user' />
            <div className='profile-info'>
              <h3>{user?.fullName}</h3>
              <span className='profile-title'>{user?.bio}</span>
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
              <span className='badge'>5</span>
            </li>
            <li
              className={`menu-item ${pathname === "/message" ? "active" : ""}`}
              onClick={() => navigate("/message")}
            >
              <Fa.FaFacebookMessenger className='menu-icon' />
              <span>Message</span>
              <span className='badge'>5</span>
            </li>
            <li
              className={`menu-item ${pathname === "/setting" ? "active" : ""}`}
              onClick={() => navigate("/setting")}
            >
              <Fa.FaCog className='menu-icon' />
              <span>Setting</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LeftBar;
