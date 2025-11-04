import { Layout, Grid, Row, Col, Space, Typography, Avatar } from "antd";
import {
  UserOutlined,
  YoutubeOutlined,
  HomeOutlined,
  MessageOutlined,
} from "@ant-design/icons";
// 'useState' tidak lagi diperlukan di sini
import Navbar from "../Navbar/Navbar";
import Left from "../left/Left";
import ChatManager from "../right/ChatManager";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const { Header, Content, Sider } = Layout;
const { useBreakpoint } = Grid;

// Terima 'activeTab' dan 'onTabChange' dari props
const MainLayout = ({ children, activeTab, onTabChange }) => {
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.user);

  // State dan handler lokal telah dihapus dari file ini
  const screens = useBreakpoint();

  // --- STYLES ---
  const headerStyle = {
    position: "fixed",
    zIndex: 10,
    width: "100%",
    backgroundColor: "#fff",
    padding: "0 16px",
    borderBottom: "1px solid #f0f0f0",
    display: "flex",
    alignItems: "center",
  };

  const columnStyle = {
    height: "calc(100vh - 56px)",
    overflowY: "auto",
    padding: "16px",
    backgroundColor: "#f0f2f5",
  };

  const contentStyle = {
    ...columnStyle,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  };

  return (
    <Layout>
      <Header style={headerStyle}>
        {/* Gunakan props yang diterima untuk Navbar */}
        <Navbar activeTab={activeTab} onChange={onTabChange} user={user} />
      </Header>

      <Layout style={{ paddingTop: 56 }}>
        {/* SIDER KIRI */}
        {screens.lg && (
          <Sider width={300} style={columnStyle} className='hide-scrollbar'>
            <Left user={user} />
          </Sider>
        )}

        {/* KONTEN UTAMA */}
        <Content style={contentStyle} className='hide-scrollbar'>
          {children}
        </Content>

        {/* SIDER KANAN */}
        {screens.md && (
          <Sider width={300} style={columnStyle} className='hide-scrollbar'>
            <ChatManager />
          </Sider>
        )}
      </Layout>

      {/* NAVIGASI MOBILE BAWAH */}
      {!screens.md && (
        <Row
          gutter={[16, 26]}
          style={{
            position: "fixed",
            bottom: 0,
            padding: 10,
            zIndex: 10,
            width: "100%",
            backgroundColor: "#fff",
          }}
        >
          <Col xs={6}>
            <Space
              direction='vertical'
              align='center'
              style={{ width: "100%", cursor: "pointer" }}
              onClick={() => onTabChange("1")} // Gunakan 'onTabChange' dari props
            >
              <HomeOutlined style={{ fontSize: 20 }} />
              <Typography.Text>Home</Typography.Text>
            </Space>
          </Col>

          <Col xs={6}>
            <Space
              direction='vertical'
              align='center'
              style={{ width: "100%" }}
              onClick={() => onTabChange("2")} // Gunakan 'onTabChange' dari props
            >
              <YoutubeOutlined style={{ fontSize: 20 }} />
              <Typography.Text>Reels</Typography.Text>
            </Space>
          </Col>

          <Col xs={6}>
            <Space
              direction='vertical'
              align='center'
              style={{ width: "100%" }}
              onClick={() => navigate("/chat")}
            >
              <MessageOutlined style={{ fontSize: 20 }} />
              <Typography.Text>Chat</Typography.Text>
            </Space>
          </Col>

          <Col xs={6}>
            <Space
              direction='vertical'
              align='center'
              style={{ width: "100%" }}
              onClick={() => navigate(`/${user?.username}`)}
            >
              <Avatar src={user?.avatar} icon={<UserOutlined />} />
              <Typography.Text>You</Typography.Text>
            </Space>
          </Col>
        </Row>
      )}
    </Layout>
  );
};

export default MainLayout;
