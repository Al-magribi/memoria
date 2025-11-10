import React, { useEffect } from "react";
import { Flex, Button, Avatar, Typography, Input, Empty, Grid } from "antd";
// --- 1. Impor CheckOutlined ---
import {
  ArrowLeftOutlined,
  SendOutlined,
  CheckOutlined,
  CheckCircleOutlined,
  CheckCircleFilled, // <--- TAMBAHAN
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

  const {
    data: messages,
    isLoading,
    isError,
    refetch,
  } = useGetChatsQuery(conversationId, { skip: !conversationId });

  const [markAsRead] = useMarkAsReadMutation();

  useEffect(() => {
    if (conversationId) {
      markAsRead(conversationId);
    }
  }, [conversationId, markAsRead]);

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

  // --- (Logika auto-scroll tidak berubah) ---
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, chatBodyRef]);
  // --- (Akhir logika auto-scroll) ---

  return (
    <Flex vertical style={{ height: "100%", background: "#fff" }}>
      {contact ? (
        <>
          {/* Header Chat (Tidak berubah) */}
          <Flex
            align='center'
            gap='middle'
            style={{
              padding: "12px 16px",
              borderBottom: "1px solid #f0f0f0",
              background: "#fff",
            }}
          >
            {!screens.md && (
              <Button
                icon={<ArrowLeftOutlined />}
                type='text'
                shape='circle'
                onClick={onBack}
              />
            )}
            <Avatar src={contact.avatar} size='large' />
            <Flex vertical>
              <Text strong>{contact.name}</Text>
              <Text type='secondary' style={{ fontSize: 12 }}>
                {contact.isLogin ? "Online" : "Offline"}
              </Text>
            </Flex>
          </Flex>

          {/* Badan Chat (Pesan) */}
          <Flex
            vertical
            gap='middle'
            ref={chatBodyRef}
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              background: "#f9f9f9",
            }}
          >
            {/* ... (Logika Loading/Error tidak berubah) ... */}
            {isLoading ? (
              <Flex align='center' justify='center' style={{ height: "100%" }}>
                <Typography.Text>Loading messages...</Typography.Text>
              </Flex>
            ) : isError ? (
              <Flex align='center' justify='center' style={{ height: "100%" }}>
                <Typography.Text type='danger'>
                  Failed to load messages.
                </Typography.Text>
              </Flex>
            ) : (
              (messages || []).map((msg) => (
                <Flex
                  key={msg._id}
                  justify={
                    msg.sender._id === user._id ? "flex-end" : "flex-start"
                  }
                  gap='small'
                  align='flex-end'
                >
                  {/* Tampilkan avatar 'other' */}
                  {msg.sender._id !== user._id && (
                    <Avatar src={contact.avatar} size='small' />
                  )}

                  <Flex
                    vertical
                    align={
                      msg.sender._id === user._id ? "flex-end" : "flex-start"
                    }
                  >
                    {/* Bubble Chat (Tidak berubah) */}
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

                    {/* --- 2. PERUBAHAN DI SINI: BUNGKUS TIMESTAMP DAN IKON --- */}
                    <Flex
                      align='center'
                      gap={4}
                      style={{ marginTop: 4 }}
                      // Posisikan di kanan jika itu pesan kita
                      justify={
                        msg.sender._id === user._id ? "flex-end" : "flex-start"
                      }
                    >
                      {/* Timestamp */}
                      <Text type='secondary' style={{ fontSize: 10 }}>
                        {new Date(msg.createdAt).toLocaleTimeString("id-ID", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </Text>

                      {/* --- 3. TAMBAHKAN IKON READ RECEIPT --- */}
                      {/* Tampilkan ikon HANYA jika pesan ini dari kita (user) */}
                      {msg.sender._id === user._id &&
                        (msg.readBy?.includes(contact?.id) ? (
                          <CheckCircleFilled style={{ color: "green" }} />
                        ) : (
                          <CheckCircleOutlined />
                        ))}
                      {/* --- AKHIR TAMBAHAN IKON --- */}
                    </Flex>
                    {/* --- AKHIR PERUBAHAN --- */}
                  </Flex>

                  {/* Tampilkan avatar 'me' */}
                  {msg.sender._id === user._id && (
                    <Avatar src={user.avatar} size='small' />
                  )}
                </Flex>
              ))
            )}
          </Flex>

          {/* Input Chat (Tidak berubah) */}
          <Flex
            gap='middle'
            style={{
              padding: "16px",
              borderTop: "1px solid #f0f0f0",
              background: "#fff",
            }}
          >
            <Input.TextArea
              placeholder='Type a message...'
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
              type='primary'
              icon={<SendOutlined />}
              onClick={onSendMessage}
              disabled={!currentMessage.trim() || isSending}
              loading={isSending}
            />
          </Flex>
        </>
      ) : (
        // Tampilan jika belum ada chat dipilih (Tidak berubah)
        <Flex align='center' justify='center' style={{ height: "100%" }}>
          <Empty description='Select a contact to start chatting' />
        </Flex>
      )}
    </Flex>
  );
};

export default ChatWindow;
