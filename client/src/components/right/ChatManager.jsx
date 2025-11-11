import React, { useState } from "react";
import ContactList from "./ContactList";
import ChatWindow from "./ChatWindow"; // Kita akan gunakan ChatWindow yang sudah di-upgrade
import "./Chat.css";

const ChatManager = () => {
  const [openChats, setOpenChats] = useState([]);

  const handleContactClick = (user) => {
    // Gunakan _id dari MongoDB, bukan id
    if (!openChats.some((chat) => chat._id === user._id)) {
      setOpenChats((prevChats) => [...prevChats, user]);
    }
  };

  const handleCloseChat = (userId) => {
    // Pastikan kita memfilter berdasarkan _id
    setOpenChats((prevChats) =>
      prevChats.filter((chat) => chat._id !== userId)
    );
  };

  return (
    <>
      {/* ContactList akan memanggil handleContactClick dengan objek user */}
      <ContactList onContactClick={handleContactClick} />

      <div className="active-chats-container">
        {openChats.map((user) => (
          <ChatWindow
            key={user._id} // Gunakan _id sebagai key
            user={user} // Kirim seluruh objek user (teman)
            onClose={() => handleCloseChat(user._id)}
          />
        ))}
      </div>
    </>
  );
};

export default ChatManager;
