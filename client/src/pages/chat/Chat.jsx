import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  Input,
  List,
  Avatar,
  Badge,
  Typography,
  Flex,
  Button,
  Row,
  Col,
  Grid,
  Empty,
} from "antd";
import { ArrowLeftOutlined, SendOutlined } from "@ant-design/icons";
// Impor data Dummies, path-nya disesuaikan dari src/components/center/chat/
import { Contacts, Conversations, User } from "../../Dummies";
import MainLayout from "../../components/layout/MainLayout";
import { useNavigate } from "react-router-dom";

const { useBreakpoint } = Grid;
const { Text, Paragraph } = Typography;

const Chat = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();

  // State untuk melacak siapa yang sedang diajak bicara
  const [selectedContactId, setSelectedContactId] = useState(null);

  // State untuk teks di kotak input
  const [currentMessage, setCurrentMessage] = useState("");

  // State untuk menyimpan semua data percakapan (agar bisa di-update)
  const [conversationsData, setConversationsData] = useState(Conversations);

  // State untuk filter pencarian
  const [searchTerm, setSearchTerm] = useState("");

  // Ref untuk auto-scroll ke pesan terbaru
  const chatBodyRef = useRef(null);

  // Cari objek kontak yang sedang dipilih
  const selectedContact = Contacts.find((c) => c.id === selectedContactId);

  // Filter daftar kontak berdasarkan pencarian
  const filteredContacts = Contacts.filter((c) =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fungsi untuk auto-scroll ke bawah setiap ada pesan baru
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [conversationsData, selectedContactId]); // Jalankan tiap ID atau data berubah

  // Fungsi untuk mengirim pesan
  const handleSendMessage = () => {
    if (!currentMessage.trim() || !selectedContactId) return;

    const newMessage = {
      id: `msg${Date.now()}`,
      text: currentMessage,
      senderId: "me", // 'me' menandakan pengirim adalah kita (User)
      timestamp: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    // Update state percakapan
    setConversationsData((prev) => ({
      ...prev,
      [selectedContactId]: [...(prev[selectedContactId] || []), newMessage],
    }));
    setCurrentMessage(""); // Kosongkan input
  };

  const handleLayoutTabChange = (key) => {
    // Jika pengguna mengklik "Home" (key '1') or "Reels" (key '2') dari halaman Chat...
    // Kita set localStorage agar halaman Index tahu
    localStorage.setItem("activeTab", key);
    // Lalu kita navigasi kembali ke halaman Index
    navigate("/");
  };

  /**
   * =============================================================
   * KOMPONEN UI
   * =============================================================
   */

  // Komponen: Daftar Kontak (Kolom Kiri)
  const ContactListComponent = (
    <Flex vertical style={{ height: "100%" }}>
      <div style={{ padding: "16px", borderBottom: "1px solid #f0f0f0" }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Chats
        </Typography.Title>
        <Input.Search
          placeholder="Search contacts"
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ marginTop: "12px" }}
        />
      </div>
      <List
        itemLayout="horizontal"
        dataSource={filteredContacts}
        style={{ overflowY: "auto", flex: 1, height: "100%" }}
        renderItem={(contact) => (
          <List.Item
            onClick={() => setSelectedContactId(contact.id)}
            style={{
              cursor: "pointer",
              padding: "12px 16px",
              background:
                selectedContactId === contact.id ? "#e6f7ff" : "transparent",
            }}
          >
            <List.Item.Meta
              avatar={
                <Badge
                  dot={contact.online}
                  color="green"
                  offset={[-5, 35]} // Posisi dot online
                >
                  <Avatar src={contact.avatar} size="large" />
                </Badge>
              }
              title={<Text strong>{contact.name}</Text>}
              description={
                <Paragraph type="secondary" ellipsis>
                  {/* Tampilkan cuplikan pesan terakhir */}
                  {conversationsData[contact.id]?.slice(-1)[0]?.text ||
                    "No messages yet"}
                </Paragraph>
              }
            />
          </List.Item>
        )}
      />
    </Flex>
  );

  // Komponen: Jendela Obrolan (Kolom Kanan)
  const ChatWindowComponent = (
    <Flex vertical style={{ height: "100%", background: "#fff" }}>
      {selectedContact ? (
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
                onClick={() => setSelectedContactId(null)} // Kembali ke daftar kontak
              />
            )}
            <Avatar src={selectedContact.avatar} size="large" />
            <Flex vertical>
              <Text strong>{selectedContact.name}</Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {selectedContact.online ? "Online" : "Offline"}
              </Text>
            </Flex>
          </Flex>

          {/* Badan Chat (Pesan) */}
          <Flex
            vertical
            gap="middle"
            ref={chatBodyRef} // Ref untuk auto-scroll
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "16px",
              background: "#f9f9f9",
            }}
          >
            {(conversationsData[selectedContactId] || []).map((msg) => (
              <Flex
                key={msg.id}
                // 'justify' untuk memisahkan pesan 'me' dan 'other'
                justify={msg.senderId === "me" ? "flex-end" : "flex-start"}
                gap="small"
                align="flex-end"
              >
                {/* Tampilkan avatar 'other' */}
                {msg.senderId !== "me" && (
                  <Avatar src={selectedContact.avatar} size="small" />
                )}

                <Flex
                  vertical
                  align={msg.senderId === "me" ? "flex-end" : "flex-start"}
                >
                  {/* Bubble Chat */}
                  <div
                    style={{
                      background: msg.senderId === "me" ? "#0084ff" : "#f0f0f0",
                      color: msg.senderId === "me" ? "#fff" : "#000",
                      padding: "8px 12px",
                      borderRadius: "18px",
                      maxWidth: "300px", // Batas lebar bubble
                    }}
                  >
                    <Text style={{ color: "inherit", whiteSpace: "pre-wrap" }}>
                      {msg.text}
                    </Text>
                  </div>
                  {/* Timestamp */}
                  <Text type="secondary" style={{ fontSize: 10, marginTop: 4 }}>
                    {msg.timestamp}
                  </Text>
                </Flex>

                {/* Tampilkan avatar 'me' */}
                {msg.senderId === "me" && (
                  <Avatar src={User.avatar} size="small" />
                )}
              </Flex>
            ))}
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
              onChange={(e) => setCurrentMessage(e.target.value)}
              onPressEnter={(e) => {
                // Kirim jika menekan Enter (tanpa Shift)
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              autoSize={{ minRows: 1, maxRows: 4 }} // Input bisa membesar
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSendMessage}
              disabled={!currentMessage.trim()}
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

  /**
   * =============================================================
   * LOGIKA RESPONSIVE
   * =============================================================
   */

  return (
    <MainLayout activeTab={"chat"} onTabChange={handleLayoutTabChange}>
      <Card
        style={{
          width: "100%",
          height: "100%", // Mengisi tinggi area <Content>
          overflow: "hidden", // Mencegah double scrollbar
        }}
        styles={{ body: { padding: 0, height: "100%" } }}
      >
        <Row style={{ height: "100%" }}>
          {/* KOLOM KIRI (Daftar Kontak) */}
          {/* Tampilkan jika: 
            1. Tampilan Desktop (screens.md)
            ATAU 
            2. Tampilan Mobile DAN tidak ada kontak dipilih */}
          {screens.md || !selectedContactId ? (
            <Col
              xs={24} // Mobile: Full width
              md={8} // Desktop: 8/24 (1/3)
              style={{
                height: "100%",
                borderRight: screens.md ? "1px solid #f0f0f0" : "none",
              }}
            >
              {ContactListComponent}
            </Col>
          ) : null}

          {/* KOLOM KANAN (Jendela Chat) */}
          {/* Tampilkan jika:
            1. Tampilan Desktop (screens.md)
            ATAU
            2. Tampilan Mobile DAN ada kontak dipilih */}
          {screens.md || selectedContactId ? (
            <Col
              xs={24} // Mobile: Full width
              md={16} // Desktop: 16/24 (2/3)
              style={{ height: "100%" }}
            >
              {ChatWindowComponent}
            </Col>
          ) : null}
        </Row>
      </Card>
    </MainLayout>
  );
};

export default Chat;
