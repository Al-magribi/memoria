import * as Fa from "react-icons/fa";
import { useDarkMode } from "../../context/DarkModeContext";
import Notif from "./Notif";
import Request from "./Request";
import "./header.scss";
import { useState } from "react";
import { leftBarMenus } from "../left/LeftBar";
import { useNavigate } from "react-router-dom";

const MobileMenu = ({ onClose, handleClick, user }) => (
  <div className="mobile-menu-panel" onClick={(e) => e.stopPropagation()}>
    <div className="mobile-menu-header">
      <span>Menu</span>
      <button onClick={onClose}>
        <Fa.FaTimes />
      </button>
    </div>

    <div className="profile-section">
      <div className="profile-header">
        <img src={user.profilePicture} alt="user" />
        <div className="profile-info">
          <h3>{user.name}</h3>
          <span className="profile-title">{user.title}</span>
        </div>
      </div>
    </div>

    <div className="mobile-menu-list">
      {leftBarMenus.map((item, idx) => (
        <div
          className="mobile-menu-item"
          key={idx}
          onClick={() => handleClick(item)}
        >
          <span className="mobile-menu-icon">{item.icon}</span>
          <span>{item.label}</span>
        </div>
      ))}
    </div>
  </div>
);

const Header = () => {
  const navigate = useNavigate();
  const { isDark, toggleDarkMode } = useDarkMode();
  const [menuOpen, setMenuOpen] = useState(false);

  const isMobile = window.innerWidth <= 1024;

  const handleClick = (menu) => {
    navigate(menu.path);
    setMenuOpen(false);
  };

  const user = {
    name: "Jadid Al Magribi",
    title: "Full Stack Developer",
    profilePicture: "./user-1.jpg",
  };

  return (
    <div className="header">
      <div className="header-container">
        <div className="header-left">
          <div className="brand">
            <Fa.FaCode className="brand-icon" />
            <h1>Memoria</h1>
          </div>
        </div>

        <div className="header-center">
          <div className="search-container">
            <Fa.FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Cari proyek, koneksi, atau konten..."
            />
          </div>
        </div>

        <div className="header-right">
          <div className="user-actions">
            <button
              className={`theme-toggle ${isDark ? "dark" : "light"}`}
              onClick={toggleDarkMode}
            >
              {isDark ? <Fa.FaSun /> : <Fa.FaMoon />}
            </button>

            {!isMobile && (
              <div className="notification-btn icon-btn">
                <Fa.FaBell />
                <span className="notification-badge">3</span>
                <Notif />
              </div>
            )}

            {isMobile ? (
              <button
                className="menu-btn icon-btn"
                onClick={() => setMenuOpen(true)}
              >
                <Fa.FaBars />
              </button>
            ) : (
              <div className="message-btn icon-btn">
                <Fa.FaUser />
                <span className="message-badge">5</span>
                <Request />
              </div>
            )}
          </div>
        </div>
      </div>

      {menuOpen && (
        <div
          className="mobile-menu-backdrop"
          onClick={() => setMenuOpen(false)}
        >
          <MobileMenu
            open={menuOpen}
            onClose={() => setMenuOpen(false)}
            handleClick={handleClick}
            user={user}
          />
        </div>
      )}
    </div>
  );
};

export default Header;
