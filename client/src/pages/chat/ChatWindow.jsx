import React, { useEffect } from "react";
import { Flex, Button, Avatar, Typography, Input, Empty, Grid } from "antd";
// --- 1. Impor Ikon ---
import {
  ArrowLeftOutlined,
  SendOutlined,
  CheckCircleOutlined,
  CheckCircleFilled,
  UserOutlined, // <--- Ikon terisi
} from "@ant-design/icons";
import {
  useGetChatsQuery,
  useMarkAsReadMutation,
} from "../../service/chat/ApiChat";
import { useSocket } from "../../context/SocketContext";

const { useBreakpoint } = Grid;
const { Text } = Typography;

const ChatWindow = ({
  contact,
  conversationId,
  user,
  onSendMessage,
  isSending,
  currentMessage,
  onCurrentMessageChange,
  onBack,
  chatBodyRef,
}) => {
  const socket = useSocket();
  const screens = useBreakpoint();

  // Ambil pesan hanya jika conversationId ada
  const {
    data: messages,
    isLoading,
    isError,
    refetch,
  } = useGetChatsQuery(conversationId, { skip: !conversationId });

  const [markAsRead] = useMarkAsReadMutation();

  // Tandai pesan sebagai dibaca saat membuka chat
  useEffect(() => {
    if (conversationId) {
      markAsRead(conversationId);
    }
  }, [conversationId, markAsRead]);

  // Efek Socket.IO untuk pesan baru dan status "dibaca"
  useEffect(() => {
    if (socket) {
      const handleNewChat = () => {
        refetch();
        if (conversationId) {
          markAsRead(conversationId);
        }
      };

      const handleMessagesRead = (data) => {
        if (data.conversationId === conversationId) {
          refetch();
        }
      };

      socket.on("newChat", handleNewChat);
      socket.on("messagesRead", handleMessagesRead);

      return () => {
        socket.off("newChat", handleNewChat);
        socket.off("messagesRead", handleMessagesRead);
      };
    }
  }, [socket, refetch, conversationId, markAsRead]);

  // Efek untuk auto-scroll ke pesan terbaru
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, chatBodyRef]);

  return (
    <Flex vertical style={{ height: "100%", background: "#fff" }}>
      {contact ? (
        <>
          {/* Header Chat */}
          <Flex
            align="center"
            gap="middle"
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #f0f0f0",
              background: "#fff",
            }}
          >
            {!screens.md && (
              <Button
                icon={<ArrowLeftOutlined />}
                type="text"
                shape="circle"
                onClick={onBack}
              />
            )}
            <Avatar icon={<UserOutlined />} src={contact.avatar} size="large" />
            <Flex vertical>
              <Text strong>{contact.name}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {contact.isLogin ? "Online" : "Offline"}
              </Text>
            </Flex>
          </Flex>

          {/* Badan Chat (Pesan) */}
          <Flex
            vertical
            gap="middle"
            ref={chatBodyRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              background: "#f9f9f9",
            }}
            className="custom-scrollbar"
          >
            {/* --- AWAL BLOK LOGIKA YANG DIPERBAIKI --- */}
            {isLoading ? (
              // 1. Tampilkan Loading
              <Flex align="center" justify="center" style={{ height: "100%" }}>
                <Typography.Text>Loading messages...</Typography.Text>
              </Flex>
            ) : isError ? (
              // 2. Tampilkan Error
              <Flex align="center" justify="center" style={{ height: "100%" }}>
                <Typography.Text type="danger">
                  Failed to load messages.
                </Typography.Text>
              </Flex>
            ) : // 3. Logika Inti:
            //    HANYA render pesan jika:
            //    a) Ada conversationId (bukan chat baru)
            //    b) `messages` ada (bukan undefined)
            //    c) `messages` tidak kosong
            conversationId && messages && messages.length > 0 ? (
              messages.map((msg) => (
                <Flex
                  key={msg._id}
                  justify={
                    msg.sender._id === user._id ? "flex-end" : "flex-start"
                  }
                  gap="small"
                  align="flex-end"
                >
                  {/* Tampilkan avatar 'other' */}
                  {msg.sender._id !== user._id && (
                    <Avatar
                      icon={<UserOutlined />}
                      src={contact.avatar}
                      size="small"
                    />
                  )}

                  <Flex
                    vertical
                    align={
                      msg.sender._id === user._id ? "flex-end" : "flex-start"
                    }
                  >
                    {/* Bubble Chat */}
                    <div
                      style={{
                        background:
                          msg.sender._id === user._id ? "#0084ff" : "#f0f0f0",
                        color: msg.sender._id === user._id ? "#fff" : "#000",
                        padding: "8px 12px",
                        borderRadius: "18px",
                        maxWidth: "300px",
                      }}
                    >
                      <Text
                        style={{ color: "inherit", whiteSpace: "pre-wrap" }}
                      >
                        {msg.content}
                      </Text>
                    </div>

                    {/* Timestamp dan Read Receipt */}
                    <Flex
                      align="center"
                      gap={4}
                      style={{ marginTop: 4 }}
                      justify={
                        msg.sender._id === user._id ? "flex-end" : "flex-start"
                      }
                    >
                      <Text type="secondary" style={{ fontSize: 10 }}>
                        {new Date(msg.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>

                      {/* Ikon Read Receipt */}
                      {msg.sender._id === user._id &&
                        (msg.readBy?.includes(contact?.id) ? (
                          // Sudah dibaca oleh kontak
                          <CheckCircleFilled style={{ color: "green" }} />
                        ) : (
                          // Terkirim (tapi belum dibaca)
                          <CheckCircleOutlined />
                        ))}
                    </Flex>
                  </Flex>

                  {/* Tampilkan avatar 'me' */}
                  {msg.sender._id === user._id && (
                    <Avatar
                      icon={<UserOutlined />}
                      src={user.avatar}
                      size="small"
                    />
                  )}
                </Flex>
              ))
            ) : (
              // 4. Fallback (Jika tidak loading, tidak error, TAPI tidak ada pesan)
              //    Ini akan menangani kasus `conversationId` null (kontak baru)
              <Flex align="center" justify="center" style={{ height: "100%" }}>
                <Empty description="Send a message to start the conversation" />
              </Flex>
            )}
            {/* --- AKHIR BLOK LOGIKA YANG DIPERBAIKI --- */}
          </Flex>

          {/* Input Chat */}
          <Flex
            gap="middle"
            style={{
              padding: "16px",
              borderTop: "1px solid #f0f0f0",
              background: "#fff",
            }}
          >
            <Input.TextArea
              placeholder="Type a message..."
              value={currentMessage}
              onChange={(e) => onCurrentMessageChange(e.target.value)}
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
              autoSize={{ minRows: 1, maxRows: 4 }}
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={onSendMessage}
              disabled={!currentMessage.trim() || isSending}
              loading={isSending}
            />
          </Flex>
        </>
      ) : (
        // Tampilan jika belum ada chat dipilih
        <Flex align="center" justify="center" style={{ height: "100%" }}>
          <Empty description="Select a contact to start chatting" />
        </Flex>
      )}
    </Flex>
  );
};

export default ChatWindow;
