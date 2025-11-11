import React, { useState, useEffect, useRef, useMemo } from "react";
import { Card, Row, Col, Grid } from "antd";
import MainLayout from "../../components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import ContactList from "./ContactList";
import ChatWindow from "./ChatWindow";
import {
  useGetConversationsQuery, // <-- Akan dimodifikasi
  useCreateChatMutation,
  useGetMyFriendsQuery,
  useGetUnreadQuery,
} from "../../service/chat/ApiChat";
import { useSelector } from "react-redux";
import { useSocket } from "../../context/SocketContext";

const { useBreakpoint } = Grid;

const Chat = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const { user } = useSelector((state) => state.user);

  // --- State (Tidak Berubah) ---
  const [listTab, setListTab] = useState("chats"); // 'chats' or 'contacts'
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [currentMessage, setCurrentMessage] = useState("");
  const chatBodyRef = useRef(null);

  // --- 1. PERUBAHAN PENGAMBILAN DATA ---
  // Sekarang 'useGetConversationsQuery' juga menerima 'searchTerm'
  const {
    data: conversations,
    isLoading: isLoadingConvos,
    refetch,
  } = useGetConversationsQuery({ search: searchTerm }); // <-- PERUBAHAN DI SINI

  // Query ini sudah benar, 'searchTerm' dikirim ke server
  const { data: myFriends, isLoading: isLoadingFriends } = useGetMyFriendsQuery(
    { search: searchTerm },
    { skip: false }
  );

  const {
    data: unread,
    isLoading: isLoadingUnread,
    refetch: refetchUnread,
  } = useGetUnreadQuery();
  // --- 2. LOGIKA MEMO (Tidak ada filter client-side) ---

  // MEMO 1: Daftar untuk tab "Chats"
  // 'conversations' SUDAH difilter oleh server
  const conversationContacts = useMemo(() => {
    // Buat map dari notifikasi untuk pencarian cepat (contactId -> unreadCount)
    const unreadMap = (unread?.unreadConversations || []).reduce(
      (map, item) => {
        // ID partisipan lawan adalah kunci (yang ditampilkan di list)
        if (item.participant?._id) {
          map[item.participant._id] = item.unreadCount;
        }
        return map;
      },
      {}
    );

    return (conversations || [])
      .map((convo) => {
        const other = convo.participants.find((p) => p._id !== user._id);
        if (!other || !other.firstName) return null;
        return {
          id: other._id,
          conversationId: convo._id,
          name: `${other.firstName} ${other.lastName}`,
          avatar: other.avatar,
          lastMessage: convo.lastMessage,
          isLogin: other.isLogin,
          unreadCount: unreadMap[other._id] || 0,
        };
      })
      .filter(Boolean);
  }, [conversations, user, unread]); // Hanya bergantung pada 'conversations'

  // MEMO 2: Daftar untuk tab "Contact"
  // 'myFriends' SUDAH difilter oleh server
  const friendContacts = useMemo(() => {
    return (myFriends || []).map((friend) => ({
      id: friend._id,
      conversationId: null,
      name: friend.fullName,
      avatar: friend.avatar,
      lastMessage: { content: "Start a conversation" },
      isLogin: friend.isLogin,
    }));
  }, [myFriends]); // Hanya bergantung pada 'myFriends'

  // --- 3. PERUBAHAN LOGIKA: `filteredContacts` (Sangat Disederhanakan) ---
  // Tidak perlu filter client-side lagi
  const filteredContacts = useMemo(() => {
    if (listTab === "chats") {
      // Cukup kembalikan data yang sudah difilter server
      return conversationContacts;
    } else {
      // Cukup kembalikan data yang sudah difilter server
      return friendContacts;
    }
    // Hapus 'searchTerm' dari dependensi, karena filter ada di server
  }, [listTab, conversationContacts, friendContacts]);

  // --- 4. 'selectedContact' (Tidak Berubah) ---
  // Logika ini tetap diperlukan untuk menemukan kontak yang diklik
  const selectedContact = useMemo(() => {
    if (!selectedUserId) return null;
    const fromConvo = conversationContacts.find((c) => c.id === selectedUserId);
    if (fromConvo) return fromConvo;
    const fromFriend = friendContacts.find((c) => c.id === selectedUserId);
    if (fromFriend) return fromFriend;
    return null;
  }, [selectedUserId, conversationContacts, friendContacts]);

  // --- 5. Handlers (Tidak Berubah) ---
  const [createChat, { isLoading: isSending }] = useCreateChatMutation();

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || !selectedUserId || !selectedContact) return;

    try {
      await createChat({
        receiverId: selectedContact.id,
        content: currentMessage,
      }).unwrap();
      setCurrentMessage("");
      if (!selectedContact.conversationId) {
        refetch();
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleLayoutTabChange = (key) => {
    localStorage.setItem("activeTab", key);
    navigate("/");
  };

  // Socket.IO useEffect (Tidak Berubah)
  useEffect(() => {
    if (socket) {
      const handleNewChat = () => {
        refetch();
        refetchUnread();
      };

      const handleMessagesRead = (data) => {
        // Jika ada pesan yang ditandai dibaca, kita juga harus refetch notifikasi
        if (data.readBy.toString() !== user._id.toString()) {
          refetchUnread(); // <-- TAMBAHAN: Refetch notifikasi
        }
      };

      socket.on("newChat", handleNewChat);
      socket.on("messagesRead", handleMessagesRead);

      return () => {
        socket.off("newChat", handleNewChat);
        socket.off("messagesRead", handleMessagesRead);
      };
    }
  }, [refetch, socket, refetchUnread, user]);

  // --- 6. Render (Tidak Berubah) ---
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
                selectedContactId={selectedUserId}
                onSelectContact={setSelectedUserId}
                onSearch={setSearchTerm}
                loading={isLoadingConvos || isLoadingFriends} // Gabungkan loading
                activeListTab={listTab}
                onListTabChange={setListTab}
              />
            </Col>
          )}

          {(screens.md || selectedUserId) && (
            <Col xs={24} md={16} style={{ height: "100%" }}>
              <ChatWindow
                contact={selectedContact}
                conversationId={selectedContact?.conversationId}
                user={user}
                onSendMessage={handleSendMessage}
                isSending={isSending}
                currentMessage={currentMessage}
                onCurrentMessageChange={setCurrentMessage}
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
