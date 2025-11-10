import React, { useEffect } from "react";
import { Flex, Button, Avatar, Typography, Input, Empty, Grid } from "antd";
import { ArrowLeftOutlined, SendOutlined } from "@ant-design/icons";
import { useGetChatsQuery } from "../../service/chat/ApiChat";
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
  chatBodyRef, // <--- Ref tetap diterima dari parent
}) => {
  const socket = useSocket();
  const screens = useBreakpoint();
  const {
    data: messages,
    isLoading,
    isError,
    refetch,
  } = useGetChatsQuery(conversationId, { skip: !conversationId });

  useEffect(() => {
    if (socket) {
      const handleNewChat = () => {
        refetch();
      };

      socket.on("newChat", handleNewChat);

      return () => socket.off("newChat", handleNewChat);
    }
  }, [socket, refetch]);

  // --- PERBAIKAN DI SINI ---
  // Tambahkan useEffect ini untuk menangani auto-scroll
  // 'messages' adalah dependensi kuncinya
  useEffect(() => {
    if (chatBodyRef.current) {
      // Set scrollTop ke scrollHeight untuk memaksa scroll ke bawah
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, chatBodyRef]); // Akan re-run setiap 'messages' berubah
  // --- AKHIR PERBAIKAN ---

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
            {/* Tombol Kembali (Hanya di Mobile) */}
            {!screens.md && (
              <Button
                icon={<ArrowLeftOutlined />}
                type="text"
                shape="circle"
                onClick={onBack} // Kembali ke daftar kontak
              />
            )}
            <Avatar src={contact.avatar} size="large" />
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
            ref={chatBodyRef} // <--- Ref tetap terpasang di sini
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              background: "#f9f9f9",
            }}
          >
            {/* ... (Sisa kode render pesan tidak berubah) ... */}
            {isLoading ? (
              <Flex align="center" justify="center" style={{ height: "100%" }}>
                <Typography.Text>Loading messages...</Typography.Text>
              </Flex>
            ) : isError ? (
              <Flex align="center" justify="center" style={{ height: "100%" }}>
                <Typography.Text type="danger">
                  Failed to load messages.
                </Typography.Text>
              </Flex>
            ) : (
              (messages || []).map((msg) => (
                <Flex
                  key={msg._id}
                  // 'justify' untuk memisahkan pesan 'me' dan 'other'
                  justify={
                    msg.sender._id === user._id ? "flex-end" : "flex-start"
                  }
                  gap="small"
                  align="flex-end"
                >
                  {/* Tampilkan avatar 'other' */}
                  {msg.sender._id !== user._id && (
                    <Avatar src={contact.avatar} size="small" />
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
                        maxWidth: "300px", // Batas lebar bubble
                      }}
                    >
                      <Text
                        style={{ color: "inherit", whiteSpace: "pre-wrap" }}
                      >
                        {msg.content}
                      </Text>
                    </div>
                    {/* Timestamp */}
                    <Text
                      type="secondary"
                      style={{ fontSize: 10, marginTop: 4 }}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </Flex>

                  {/* Tampilkan avatar 'me' */}
                  {msg.sender._id === user._id && (
                    <Avatar src={user.avatar} size="small" />
                  )}
                </Flex>
              ))
            )}
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
                // Kirim jika menekan Enter (tanpa Shift)
                if (!e.shiftKey) {
                  e.preventDefault();
                  onSendMessage();
                }
              }}
              autoSize={{ minRows: 1, maxRows: 4 }} // Input bisa membesar
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
        // Tampilan jika belum ada chat dipilih (hanya di desktop)
        <Flex align="center" justify="center" style={{ height: "100%" }}>
          <Empty description="Select a contact to start chatting" />
        </Flex>
      )}
    </Flex>
  );
};

export default ChatWindow;
