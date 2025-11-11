import React, { useState, useMemo, useEffect, useRef } from "react";
import { Avatar, Card, Input, Tooltip, Typography, Spin } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  MinusOutlined,
  CloseOutlined,
  SendOutlined,
} from "@ant-design/icons";
import "./Chat.css";
import {
  useGetConversationsQuery,
  useGetChatsQuery,
  useCreateChatMutation,
  useMarkAsReadMutation,
} from "../../service/chat/ApiChat";
import { useSocket } from "../../context/SocketContext";
import { useSelector } from "react-redux";

const ChatWindow = ({ user, onClose }) => {
  const [text, setText] = useState("");
  const socket = useSocket();
  const messageListRef = useRef(null);

  const { user: me } = useSelector((state) => state.user);
  const { data: allConversations } = useGetConversationsQuery({});

  const conversation = useMemo(() => {
    if (!allConversations || !me) return null;
    return allConversations.find(
      (c) =>
        c.participants.length === 2 &&
        c.participants.some((p) => p._id === me?._id) &&
        c.participants.some((p) => p._id === user._id)
    );
  }, [allConversations, me, user]);

  const conversationId = conversation?._id;

  const {
    data: messages,
    isLoading: isLoadingMessages,
    refetch: refetchMessages,
  } = useGetChatsQuery(conversationId, {
    skip: !conversationId,
  });

  const [createChat] = useCreateChatMutation();
  const [markAsRead] = useMarkAsReadMutation();

  useEffect(() => {
    if (conversationId) {
      markAsRead(conversationId);
    }
  }, [conversationId, markAsRead, messages]);

  useEffect(() => {
    if (socket) {
      const handleNewChat = () => {
        if (conversationId) {
          refetchMessages();
        }
      };
      socket.on("newChat", handleNewChat);
      return () => socket.off("newChat", handleNewChat);
    }
  }, [socket, refetchMessages, conversationId]);

  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!text.trim()) return;
    createChat({ receiverId: user._id, content: text });
    setText("");
  };

  const ChatHeader = (
    <div className="chat-header">
      <div className="chat-header-info">
        <Avatar size="small" icon={<UserOutlined />} src={user.avatar} />
        <Typography.Text strong style={{ marginLeft: 8 }}>
          {user.fullName || `${user.firstName} ${user.lastName}`}
        </Typography.Text>
      </div>
      <div className="chat-header-actions">
        <Tooltip title="Start a voice call">
          <PhoneOutlined />
        </Tooltip>
        <Tooltip title="Start a video call">
          <VideoCameraOutlined />
        </Tooltip>
        <Tooltip title="Minimize">
          <MinusOutlined />
        </Tooltip>
        <Tooltip title="Close">
          <CloseOutlined onClick={onClose} />
        </Tooltip>
      </div>
    </div>
  );

  if (!me) {
    return null;
  }

  return (
    <div className="chat-window-container">
      <Card
        title={ChatHeader}
        style={{
          padding: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
          maxHeight: "450px",
        }}
        styles={{
          body: {
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            padding: 0,
          },
        }}
      >
        {/* Bagian isi chat */}
        <div className="chat-body" ref={messageListRef}>
          {isLoadingMessages ? (
            // --- PERUBAIKAN DI SINI ---
            // Bungkus Spin dengan class placeholder agar ikut ter-center
            <div className="chat-body-placeholder">
              <Spin />
            </div>
          ) : !messages || messages.length === 0 ? (
            <div className="chat-body-placeholder">
              <Avatar size={64} icon={<UserOutlined />} src={user.avatar} />
              <Typography.Title level={5}>
                {user.fullName || `${user.firstName} ${user.lastName}`}
              </Typography.Title>
              <Typography.Text type="secondary">
                Kirim pesan pertama Anda untuk memulai percakapan.
              </Typography.Text>
            </div>
          ) : (
            <div className="message-list">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`message-item ${
                    msg.sender._id === me._id ? "my-message" : "their-message"
                  }`}
                >
                  <div className="message-bubble">{msg.content}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bagian input pesan */}
        <div className="chat-footer">
          <Input
            placeholder="Aa"
            style={{ width: "100%" }}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onPressEnter={handleSend}
            suffix={
              <Tooltip title="Send">
                <SendOutlined
                  onClick={handleSend}
                  style={{ cursor: "pointer", color: "#1877f2" }}
                />
              </Tooltip>
            }
          />
        </div>
      </Card>
    </div>
  );
};

export default ChatWindow;
