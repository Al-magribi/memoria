import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, Row, Col, Grid } from "antd";
import MainLayout from "../../components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import ContactList from "./ContactList";
import ChatWindow from "./ChatWindow";
import {
  useGetConversationsQuery,
  useCreateChatMutation,
  useGetMyFriendsQuery,
} from "../../service/chat/ApiChat";
import { useSelector } from "react-redux";
import { useSocket } from "../../context/SocketContext";

const { useBreakpoint } = Grid;

const Chat = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const { user } = useSelector((state) => state.user);

  // --- PERUBAHAN 1 ---
  // Mengganti nama state agar lebih jelas. Ini akan *selalu* User ID.
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [currentMessage, setCurrentMessage] = useState("");

  const {
    data: conversations,
    isLoading,
    refetch,
  } = useGetConversationsQuery();

  const [searchTerm, setSearchTerm] = useState("");
  const chatBodyRef = useRef(null);

  const { data: myFriends } = useGetMyFriendsQuery(
    { search: searchTerm },
    { skip: !searchTerm }
  );

  // --- PERUBAHAN 2 ---
  // Memperbarui `allContacts` agar `id` *selalu* User ID.
  const allContacts = useMemo(() => {
    const conversationContacts =
      conversations
        ?.map((convo) => {
          const otherParticipant = convo.participants.find(
            (p) => p._id !== user._id
          );
          if (!otherParticipant || !otherParticipant.fullName) {
            return null;
          }
          return {
            id: otherParticipant._id, // <-- Kunci: ID adalah User ID
            conversationId: convo._id, // <-- Simpan ID percakapan di sini
            name: otherParticipant.fullName,
            avatar: otherParticipant.avatar,
            lastMessage: convo.lastMessage,
            isLogin: otherParticipant.isLogin,
            isNew: false,
          };
        })
        .filter(Boolean) || [];

    // `existingContactIds` sekarang berisi User ID, yang sudah benar.
    const existingContactIds = new Set(conversationContacts.map((c) => c.id));

    const friendContacts =
      myFriends
        ?.filter(
          (friend) =>
            friend && friend.fullName && !existingContactIds.has(friend._id)
        )
        .map((friend) => ({
          id: friend._id,
          conversationId: null,
          name: friend.fullName,
          avatar: friend.avatar,
          lastMessage: { content: "Start a conversation" },
          isLogin: friend.isLogin,
          isNew: true,
        })) || [];

    return [...conversationContacts, ...friendContacts];
  }, [conversations, myFriends, user]);

  // Logika ini sekarang bekerja dengan sempurna:
  const filteredContacts = useMemo(() => {
    if (!searchTerm) {
      // 1. searchTerm kosong, 'myFriends' tidak di-fetch.
      // 2. 'allContacts' hanya berisi 'conversationContacts'.
      // 3. Filter '!contact.isNew' mengembalikan semua 'conversationContacts'.
      // (Persyaratan 2 terpenuhi)
      return allContacts.filter((contact) => !contact.isNew);
    }
    // 1. searchTerm ada, 'myFriends' di-fetch dengan filter.
    // 2. 'allContacts' berisi 'conversations' + 'filtered friends'.
    // 3. Filter 'c.name.includes' mencari di keduanya.
    // (Persyaratan 1 terpenuhi)
    return allContacts.filter((c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allContacts, searchTerm]);

  // --- PERUBAHAN 3 ---
  // Mencari kontak berdasarkan `selectedUserId`
  const selectedContact = allContacts.find((c) => c.id === selectedUserId);

  const [createChat, { isLoading: isSending }] = useCreateChatMutation();

  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
    // Mengganti dependensi ke `selectedUserId`
  }, [selectedUserId]);

  // --- PERUBAHAN 4 ---
  // Memperbarui `handleSendMessage` untuk menggunakan `selectedContact.id`
  const handleSendMessage = async () => {
    // Gunakan `selectedUserId` untuk pengecekan
    if (!currentMessage.trim() || !selectedUserId) return;

    try {
      await createChat({
        // `selectedContact.id` sekarang adalah `receiverId` (User ID)
        receiverId: selectedContact.id,
        content: currentMessage,
      }).unwrap();
      setCurrentMessage("");
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleLayoutTabChange = (key) => {
    localStorage.setItem("activeTab", key);
    navigate("/");
  };

  // --- PERBAIKAN DI SINI ---
  useEffect(() => {
    if (socket) {
      // 1. Buat fungsi handler yang spesifik
      const handleNewChat = () => {
        // Refetch daftar percakapan (untuk ContactList)
        refetch();
      };

      // 2. Daftarkan handler
      socket.on("newChat", handleNewChat);

      // 3. Kembalikan fungsi cleanup yang menghapus handler YANG SAMA
      return () => {
        socket.off("newChat", handleNewChat);
      };
    }
  }, [refetch, socket]); // Dependensi sudah benar
  // --- AKHIR PERBAIKAN ---
  return (
    <MainLayout activeTab={"chat"} onTabChange={handleLayoutTabChange}>
      <Card
        style={{
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
        styles={{ body: { padding: 0, height: "100%" } }}
      >
        <Row style={{ height: "100%" }}>
          {/* --- PERUBAHAN 5 --- */}
          {/* Menggunakan `selectedUserId` untuk logika tampilan mobile */}
          {(screens.md || !selectedUserId) && (
            <Col
              xs={24}
              md={8}
              style={{
                height: "100%",
                borderRight: screens.md ? "1px solid #f0f0f0" : "none",
              }}
            >
              <ContactList
                contacts={filteredContacts}
                // Mengirim `selectedUserId` sebagai prop
                selectedContactId={selectedUserId}
                onSelectContact={setSelectedUserId}
                onSearch={setSearchTerm}
                loading={isLoading}
              />
            </Col>
          )}

          {/* Menggunakan `selectedUserId` untuk logika tampilan mobile */}
          {(screens.md || selectedUserId) && (
            <Col xs={24} md={16} style={{ height: "100%" }}>
              <ChatWindow
                contact={selectedContact}
                // --- PERUBAHAN 6 (KUNCI) ---
                // Teruskan `conversationId` yang benar (bisa null)
                conversationId={selectedContact?.conversationId}
                user={user}
                onSendMessage={handleSendMessage}
                isSending={isSending}
                currentMessage={currentMessage}
                onCurrentMessageChange={setCurrentMessage}
                // Set state kembali ke null
                onBack={() => setSelectedUserId(null)}
                chatBodyRef={chatBodyRef}
              />
            </Col>
          )}
        </Row>
      </Card>
    </MainLayout>
  );
};

export default Chat;
