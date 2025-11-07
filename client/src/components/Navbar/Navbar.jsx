import { Input, Avatar, Flex, Button, Grid, Tabs } from "antd";
import {
  BellFilled,
  MessageFilled,
  SearchOutlined,
  YoutubeOutlined,
  HomeOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { useBreakpoint } = Grid;

const Navbar = ({ activeTab, onChange, user }) => {
  const navigate = useNavigate();
  const screens = useBreakpoint();

  const items = [
    { label: "Feeds", key: "1", icon: <HomeOutlined /> },
    { label: "Reels", key: "2", icon: <YoutubeOutlined /> },
  ];

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      {/* Header Bagian Kiri: Logo & Search */}
      <Flex
        gap="middle"
        align="center"
        style={{ width: !screens.md ? "100%" : "285px" }}
      >
        <img
          src="logo.png"
          alt="almadev"
          style={{ width: "35px", borderRadius: "50%" }}
        />
        {/* Sembunyikan input search di layar xs agar tidak terlalu penuh */}

        <Input
          prefix={<SearchOutlined />}
          placeholder="Cari apapun ..."
          style={{ borderRadius: "20px" }}
        />
      </Flex>

      {/* Header Bagian Tengah: Navigasi Utama */}
      {/* Tampilkan hanya di layar 'md' ke atas, agar konsisten dengan sidebar */}
      {screens.md && (
        <Tabs
          centered
          items={items}
          activeKey={activeTab}
          onChange={onChange}
        />
      )}

      {/* Tampilkan hanya di layar 'md' ke atas */}
      {screens.md && (
        <Flex
          gap="middle"
          align="center"
          justify="center"
          style={{ width: "285px" }}
        >
          <Button
            shape="circle"
            size="large"
            icon={<MessageFilled />}
            onClick={() => navigate("/chat")}
          />

          <Button shape="circle" size="large" icon={<BellFilled />} />

          <Avatar
            size="large"
            icon={<UserOutlined />}
            src={user?.avatar}
            onClick={() => navigate(`/${user?.username}`)}
            style={{ cursor: "pointer" }}
          />
        </Flex>
      )}
    </div>
  );
};

export default Navbar;
