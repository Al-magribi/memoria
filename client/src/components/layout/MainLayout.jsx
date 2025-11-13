import { Layout, Grid, Row, Col, Space, Typography, Avatar, Badge } from "antd";
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
import { useGetUnreadQuery } from "../../service/chat/ApiChat";

const { Footer, Header, Content, Sider } = Layout;
const { useBreakpoint } = Grid;

// Terima 'activeTab' dan 'onTabChange' dari props
const MainLayout = ({ children, activeTab, onTabChange, setSearchTerm }) => {
  const navigate = useNavigate();

  const { user, isLoading } = useSelector((state) => state.user);

  const { data: unread } = useGetUnreadQuery();

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
        <Navbar
          activeTab={activeTab}
          onChange={onTabChange}
          user={user}
          setSearchTerm={setSearchTerm}
        />
      </Header>

      <Layout style={{ paddingTop: 56, marginBottom: !screens.md ? 100 : 0 }}>
        {/* SIDER KIRI */}
        {screens.lg && (
          <Sider width={300} style={columnStyle} className='hide-scrollbar'>
            <Left user={user} isLoading={isLoading} />
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
        <Footer
          style={{
            backgroundColor: "#fff",
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
            width: "100%",
            padding: "20px 0",
          }}
        >
          <Row gutter={[16, 26]}>
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
              <Badge count={unread?.totalUnreadCount}>
                <Space
                  direction='vertical'
                  align='center'
                  style={{ width: "100%" }}
                  onClick={() => navigate("/chat")}
                >
                  <MessageOutlined style={{ fontSize: 20 }} />
                  <Typography.Text>Chat</Typography.Text>
                </Space>
              </Badge>
            </Col>

            <Col xs={6}>
              <Space
                direction='vertical'
                align='center'
                style={{ width: "100%" }}
                onClick={() => navigate(`/${user?.fullName}`)}
              >
                <Avatar src={user?.avatar} icon={<UserOutlined />} />
                <Typography.Text>You</Typography.Text>
              </Space>
            </Col>
          </Row>
        </Footer>
      )}
    </Layout>
  );
};

export default MainLayout;
