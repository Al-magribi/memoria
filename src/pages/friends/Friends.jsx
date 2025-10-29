import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Input,
  Row,
  Col,
  Avatar,
  Typography,
  Button,
  Flex,
  Empty,
} from "antd";
import {
  UserAddOutlined,
  CheckOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import MainLayout from "../../components/layout/MainLayout";
import { AllUsers } from "../../Dummies";
import UserCard from "./UserCard";

const { Title, Text } = Typography;
const { Search } = Input;

const Friends = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredUsers = useMemo(() => {
    if (!searchTerm) {
      return AllUsers; // Tampilkan semua jika tidak ada pencarian
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return AllUsers.filter(
      (user) =>
        user.name.toLowerCase().includes(lowerCaseSearch) ||
        user.username.toLowerCase().includes(lowerCaseSearch)
    );
  }, [searchTerm]);

  const handleLayoutTabChange = (key) => {
    // Jika pengguna mengklik "Home" (key '1') or "Reels" (key '2') dari halaman Chat...
    // Kita set localStorage agar halaman Index tahu
    localStorage.setItem("activeTab", key);
    // Lalu kita navigasi kembali ke halaman Index
    navigate("/");
  };
  return (
    <MainLayout activeTab={"friends"} onTabChange={handleLayoutTabChange}>
      <Card style={{ width: "100%" }}>
        <Title level={3} style={{ marginTop: 0 }}>
          Find Your Friends
        </Title>
        <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
          Connect with them in Memoria
        </Text>

        {/* Input Pencarian */}
        <Search
          placeholder="Search for name or username"
          onSearch={(value) => setSearchTerm(value)} // Bisa juga pakai onChange untuk live search
          onChange={(e) => setSearchTerm(e.target.value)} // Live search
          enterButton={<SearchOutlined />}
          size="large"
          style={{ marginBottom: 24 }}
        />

        {/* Grid Hasil Pencarian */}
        <Row gutter={[16, 16]}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              // Pengaturan Col responsif:
              // - xs: 1 card per baris (lebar 24) di layar ekstra kecil
              // - sm: 2 card per baris (lebar 12) di layar kecil
              // - md: 3 card per baris (lebar 8) di layar sedang
              // - lg: 4 card per baris (lebar 6) di layar besar
              <Col xs={24} sm={12} md={8} lg={6} key={user.id}>
                <UserCard user={user} />
              </Col>
            ))
          ) : (
            // Tampilan jika tidak ada hasil
            <Col span={24}>
              <Empty
                description={
                  <Text type="secondary">
                    user is not found for "<strong>{searchTerm}</strong>"
                  </Text>
                }
              />
            </Col>
          )}
        </Row>
      </Card>
    </MainLayout>
  );
};

export default Friends;
