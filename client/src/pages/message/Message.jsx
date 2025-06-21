import React, { useState, useEffect } from "react";
import * as Fa from "react-icons/fa";
import Layout from "../../components/layout/Layout";
import "./message.scss";
import { useSearchParams } from "react-router-dom";

const Message = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Mock data for chats
  const chats = [
    {
      id: 1,
      name: "John Doe",
      avatar:
        "https://images.pexels.com/photos/1036622/pexels-photo-1036622.jpeg",
      lastMessage: "Hey, how are you doing?",
      time: "2:30 PM",
      unread: 2,
      online: true,
    },
    {
      id: 2,
      name: "Jane Smith",
      avatar:
        "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg",
      lastMessage: "Thanks for the help!",
      time: "1:45 PM",
      unread: 0,
      online: false,
    },
    {
      id: 3,
      name: "Mike Johnson",
      avatar:
        "https://images.pexels.com/photos/35065/homeless-man-color-poverty.jpg",
      lastMessage: "See you tomorrow!",
      time: "12:20 PM",
      unread: 1,
      online: true,
    },
    {
      id: 4,
      name: "Sarah Wilson",
      avatar:
        "https://images.pexels.com/photos/3777931/pexels-photo-3777931.jpeg",
      lastMessage: "The meeting went well",
      time: "11:15 AM",
      unread: 0,
      online: false,
    },
    {
      id: 5,
      name: "Alex Brown",
      avatar:
        "https://images.pexels.com/photos/3124674/pexels-photo-3124674.jpeg",
      lastMessage: "Can you send me the files?",
      time: "10:30 AM",
      unread: 3,
      online: true,
    },
  ];

  // Mock data for messages
  const messages = {
    1: [
      {
        id: 1,
        sender: "John Doe",
        message: "Hey, how are you doing?",
        time: "2:30 PM",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        message: "I'm good, thanks! How about you?",
        time: "2:32 PM",
        isOwn: true,
      },
      {
        id: 3,
        sender: "John Doe",
        message: "Great! Want to grab coffee later?",
        time: "2:35 PM",
        isOwn: false,
      },
      {
        id: 4,
        sender: "You",
        message: "Sure, that sounds good!",
        time: "2:37 PM",
        isOwn: true,
      },
    ],
    2: [
      {
        id: 1,
        sender: "Jane Smith",
        message: "Thanks for the help!",
        time: "1:45 PM",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        message: "No problem at all!",
        time: "1:47 PM",
        isOwn: true,
      },
    ],
    3: [
      {
        id: 1,
        sender: "Mike Johnson",
        message: "See you tomorrow!",
        time: "12:20 PM",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        message: "Looking forward to it!",
        time: "12:22 PM",
        isOwn: true,
      },
    ],
    4: [
      {
        id: 1,
        sender: "Sarah Wilson",
        message: "The meeting went well",
        time: "11:15 AM",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        message: "That's great to hear!",
        time: "11:17 AM",
        isOwn: true,
      },
    ],
    5: [
      {
        id: 1,
        sender: "Alex Brown",
        message: "Can you send me the files?",
        time: "10:30 AM",
        isOwn: false,
      },
      {
        id: 2,
        sender: "You",
        message: "I'll send them right away",
        time: "10:32 AM",
        isOwn: true,
      },
      {
        id: 3,
        sender: "Alex Brown",
        message: "Perfect, thanks!",
        time: "10:35 AM",
        isOwn: false,
      },
    ],
  };

  // Auto select chat if friendId is in query params
  useEffect(() => {
    const friendId = searchParams.get("friendId");
    if (friendId) {
      const chat = chats.find((c) => String(c.id) === String(friendId));
      if (chat) setSelectedChat(chat);
    }
  }, [searchParams]);

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedChat) {
      const newMessage = {
        id: Date.now(),
        sender: "You",
        message: messageInput,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isOwn: true,
      };

      // In a real app, you would send this to your backend
      console.log("Sending message:", newMessage);
      setMessageInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBack = () => setSelectedChat(null);

  return (
    <Layout>
      <div className="message-container">
        {/* Mobile: show only chat-list or chat-history */}
        {isMobile ? (
          selectedChat ? (
            <div className="chat-history">
              <div className="chat-header">
                <button className="back-btn" onClick={handleBack}>
                  <Fa.FaArrowLeft />
                </button>
                <div className="chat-user-info">
                  <div className="chat-avatar">
                    <img src={selectedChat.avatar} alt={selectedChat.name} />
                    {selectedChat.online && (
                      <div className="online-indicator"></div>
                    )}
                  </div>
                  <div>
                    <h3>{selectedChat.name.slice(0, 5)}...</h3>
                    <span className="status">
                      {selectedChat.online ? "Online" : "Offline"}
                    </span>
                  </div>
                </div>
                <div className="chat-actions">
                  <button className="action-btn">
                    <Fa.FaPhone />
                  </button>
                  <button className="action-btn">
                    <Fa.FaVideo />
                  </button>
                  <button className="action-btn" onClick={handleBack}>
                    <Fa.FaArrowLeft />
                  </button>
                </div>
              </div>
              <div className="messages-container">
                <div className="messages">
                  {messages[selectedChat.id]?.map((msg) => (
                    <div
                      key={msg.id}
                      className={`message ${msg.isOwn ? "own" : "other"}`}
                    >
                      <div className="message-content">
                        <p>{msg.message}</p>
                        <span className="message-time">{msg.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="message-input-container">
                <div className="message-input-wrapper">
                  <textarea
                    className="message-textarea"
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    rows={1}
                  />
                  <button
                    className="send-btn"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                  >
                    <Fa.FaPaperPlane />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="chat-list">
              <div className="chat-list-header">
                <h2>Messages</h2>
                <div className="search-box">
                  <input type="text" placeholder="Search conversations..." />
                  <Fa.FaSearch />
                </div>
              </div>
              <div className="chat-items">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`chat-item ${
                      selectedChat?.id === chat.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="chat-avatar">
                      <img src={chat.avatar} alt={chat.name} />
                      {chat.online && <div className="online-indicator"></div>}
                    </div>
                    <div className="chat-info">
                      <div className="chat-header">
                        <h4>{chat.name}</h4>
                        <span className="chat-time">{chat.time}</span>
                      </div>
                      <div className="chat-preview">
                        <p>{chat.lastMessage}</p>
                        {chat.unread > 0 && (
                          <div className="unread-badge">{chat.unread}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        ) : (
          // Desktop: show both panels
          <>
            <div className="chat-list">
              <div className="chat-list-header">
                <h2>Messages</h2>
                <div className="search-box">
                  <input type="text" placeholder="Search conversations..." />
                  <Fa.FaSearch />
                </div>
              </div>
              <div className="chat-items">
                {chats.map((chat) => (
                  <div
                    key={chat.id}
                    className={`chat-item ${
                      selectedChat?.id === chat.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedChat(chat)}
                  >
                    <div className="chat-avatar">
                      <img src={chat.avatar} alt={chat.name} />
                      {chat.online && <div className="online-indicator"></div>}
                    </div>
                    <div className="chat-info">
                      <div className="chat-header">
                        <h4>{chat.name}</h4>
                        <span className="chat-time">{chat.time}</span>
                      </div>
                      <div className="chat-preview">
                        <p>{chat.lastMessage}</p>
                        {chat.unread > 0 && (
                          <div className="unread-badge">{chat.unread}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="chat-history">
              {selectedChat ? (
                <>
                  <div className="chat-header">
                    <div className="chat-user-info">
                      <div className="chat-avatar">
                        <img
                          src={selectedChat.avatar}
                          alt={selectedChat.name}
                        />
                        {selectedChat.online && (
                          <div className="online-indicator"></div>
                        )}
                      </div>
                      <div>
                        <h3>{selectedChat.name.slice(0, 8)}...</h3>

                        <span className="status">
                          {selectedChat.online ? "Online" : "Offline"}
                        </span>
                      </div>
                    </div>
                    <div className="chat-actions">
                      <button className="action-btn">
                        <Fa.FaPhone />
                      </button>
                      <button className="action-btn">
                        <Fa.FaVideo />
                      </button>
                    </div>
                  </div>
                  <div className="messages-container">
                    <div className="messages">
                      {messages[selectedChat.id]?.map((msg) => (
                        <div
                          key={msg.id}
                          className={`message ${msg.isOwn ? "own" : "other"}`}
                        >
                          <div className="message-content">
                            <p>{msg.message}</p>
                            <span className="message-time">{msg.time}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="message-input-container">
                    <div className="message-input-wrapper">
                      <textarea
                        className="message-textarea"
                        placeholder="Type a message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={handleKeyPress}
                        rows={1}
                      />
                      <button
                        className="send-btn"
                        onClick={handleSendMessage}
                        disabled={!messageInput.trim()}
                      >
                        <Fa.FaPaperPlane />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="no-chat-selected">
                  <div className="no-chat-content">
                    <Fa.FaComments />
                    <h3>Select a conversation</h3>
                    <p>Choose a chat from the list to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
};

export default Message;
