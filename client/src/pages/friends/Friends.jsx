// Friends.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, Typography, Tabs } from "antd";
import MainLayout from "../../components/layout/MainLayout";
import Requests from "./Requests";
import MyFriends from "./MyFriends";
import Strangers from "./Strangers";

const { Title, Text } = Typography;
// Hapus: const { TabPane } = Tabs; (Sudah tidak diperlukan)

const Friends = () => {
  const navigate = useNavigate();

  const handleLayoutTabChange = (key) => {
    localStorage.setItem("activeTab", key);
    navigate("/");
  };

  // --- PERUBAHAN DI SINI ---
  // Definisikan item tab Anda sebagai array objek
  const tabItems = [
    {
      key: "1",
      label: "Friend Requests",
      children: <Requests />, // Render komponen Anda di sini
    },
    {
      key: "2",
      label: "My Friends",
      children: <MyFriends />,
    },
    {
      key: "3",
      label: "People You May Know",
      children: <Strangers />,
    },
  ];
  // --- AKHIR PERUBAHAN ---

  return (
    <MainLayout activeTab={"friends"} onTabChange={handleLayoutTabChange}>
      <Card style={{ width: "100%" }}>
        <Title level={3} style={{ marginTop: 0 }}>
          Friends
        </Title>
        <Text type='secondary' style={{ display: "block", marginBottom: 16 }}>
          Connect with people in Memoria
        </Text>

        {/* --- PERUBAHAN DI SINI --- */}
        {/*
          Gunakan prop 'items' untuk meneruskan array tabItems.
          Kita tetap menggunakan 'destroyInactiveTab' agar efisien.
        */}
        <Tabs defaultActiveKey='1' items={tabItems} />
        {/* --- AKHIR PERUBAHAN --- */}
      </Card>
    </MainLayout>
  );
};

export default Friends;
