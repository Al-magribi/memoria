// Setting.jsx

import React, { useState } from "react";
import { Layout, Menu, Card, Typography, Grid, Tabs } from "antd";
import { UserOutlined, LockOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";

import GeneralSettings from "./GeneralSettings";
import SecuritySettings from "./SecuritySettings";
import PrivacySettings from "./PrivacySettings";

const { Content, Sider } = Layout;
const { Title } = Typography;
const { useBreakpoint } = Grid;

const Setting = () => {
  const navigate = useNavigate();
  const [selectedKey, setSelectedKey] = useState("general");

  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const handleLayoutTabChange = (key) => {
    localStorage.setItem("activeTab", key);
    navigate("/");
  };

  // Menu items untuk Sider (Desktop)
  const menuItems = [
    {
      key: "general",
      icon: <UserOutlined />,
      label: "General",
    },
    {
      key: "security",
      icon: <LockOutlined />,
      label: "Security and Login",
    },
    // --- TAMBAHAN: Menu Item Privasi ---
    {
      key: "privacy",
      icon: <EyeOutlined />,
      label: "Privacy",
    },
    // ---------------------------------
  ];

  // Definisikan 'items' untuk <Tabs> (Mobile)
  const mobileTabItems = [
    {
      key: "general",
      label: "General",
      children: <GeneralSettings />,
    },
    {
      key: "security",
      label: "Security",
      children: <SecuritySettings />,
    },
    // --- TAMBAHAN: Tab Item Privasi ---
    {
      key: "privacy",
      label: "Privacy",
      children: <PrivacySettings />,
    },
    // ---------------------------------
  ];

  // Fungsi untuk me-render konten berdasarkan key yang dipilih
  const renderContent = (key) => {
    switch (key) {
      case "general":
        return <GeneralSettings />;
      case "security":
        return <SecuritySettings />;
      // --- TAMBAHAN: Case untuk Privasi ---
      case "privacy":
        return <PrivacySettings />;
      // -----------------------------------
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <MainLayout activeTab={"setting"} onTabChange={handleLayoutTabChange}>
      <Card style={{ width: "100%" }}>
        <Title level={3} style={{ marginTop: 0 }}>
          Settings
        </Title>

        {isMobile ? (
          // --- TAMPILAN MOBILE: Gunakan <Tabs> ---
          <Tabs
            activeKey={selectedKey}
            onChange={(key) => setSelectedKey(key)}
            centered
            items={mobileTabItems} // Sudah diperbarui
          />
        ) : (
          // --- TAMPILAN DESKTOP: Gunakan <Layout> + <Sider> ---
          <Layout style={{ background: "#fff" }} direction="horizontal">
            <Sider width={200} style={{ background: "#fff" }}>
              <Menu
                mode="inline"
                selectedKeys={[selectedKey]}
                onClick={({ key }) => setSelectedKey(key)}
                style={{ borderRight: 1, height: "100%" }}
                items={menuItems} // Sudah diperbarui
              />
            </Sider>
            <Content
              style={{
                padding: "0 24px",
                minHeight: 280,
              }}
            >
              {/* Render konten yang dipilih */}
              {renderContent(selectedKey)}
            </Content>
          </Layout>
        )}
      </Card>
    </MainLayout>
  );
};

export default Setting;
