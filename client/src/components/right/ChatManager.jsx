// src/components/right/ChatManager.jsx (Versi Perbaikan Final)

import React, { useState } from "react";
import ContactList from "./ContactList";
import ChatWindow from "./ChatWindow";
import "./Chat.css";

const ChatManager = () => {
  const [openChats, setOpenChats] = useState([]);

  const handleContactClick = (user) => {
    // Cek jika chat sudah dibuka, jangan tambahkan lagi
    if (!openChats.some((chat) => chat.id === user.id)) {
      setOpenChats((prevChats) => [...prevChats, user]);
    }
  };

  const handleCloseChat = (userId) => {
    setOpenChats((prevChats) => prevChats.filter((chat) => chat.id !== userId));
  };

  return (
    <>
      <ContactList onContactClick={handleContactClick} />

      <div className='active-chats-container'>
        {openChats.map((user) => (
          <ChatWindow
            key={user.id}
            user={user}
            onClose={() => handleCloseChat(user.id)}
          />
        ))}
      </div>
    </>
  );
};

export default ChatManager;
