import {
  Input,
  Avatar,
  Flex,
  Button,
  Grid,
  Tabs,
  Space,
  message,
  Badge,
} from "antd";
import {
  MessageFilled,
  SearchOutlined,
  YoutubeOutlined,
  HomeOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Notif from "./Notif";
import { useLogoutMutation } from "../../service/user/ApiUser";
import { useEffect } from "react";
import { useGetUnreadQuery } from "../../service/chat/ApiChat";
import { useSocket } from "../../context/SocketContext";

const { useBreakpoint } = Grid;

const Navbar = ({ activeTab, onChange, user }) => {
  const socket = useSocket();

  const navigate = useNavigate();
  const screens = useBreakpoint();

  const [logout, { isSuccess, data }] = useLogoutMutation();

  const { data: unread, refetch } = useGetUnreadQuery();

  const items = [
    { label: "Feeds", key: "1", icon: <HomeOutlined /> },
    { label: "Reels", key: "2", icon: <YoutubeOutlined /> },
  ];

  const handleLogout = () => {
    logout();
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(data.message);
      window.location.href = "/signin";
    }
  }, [isSuccess, data]);

  useEffect(() => {
    if (socket) {
      const handleRefetch = () => {
        refetch();
      };

      socket.on("newChat", handleRefetch);
      socket.on("messagesRead", handleRefetch);

      return () => {
        socket.on("newChat", handleRefetch);
        socket.on("messagesRead", handleRefetch);
      };
    }
  }, [socket, refetch]);

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
          src="/logo.png"
          alt="almadev"
          style={{ width: "35px", borderRadius: "50%" }}
        />

        <Input
          prefix={<SearchOutlined />}
          placeholder="Cari apapun ..."
          style={{ borderRadius: "20px" }}
        />

        {!screens.md && (
          <Space>
            <Button
              shape="circle"
              size="large"
              icon={<UsergroupAddOutlined />}
              onClick={() => navigate("/friends")}
            />

            <Notif user={user} />

            <Button
              shape="circle"
              size="large"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            />
          </Space>
        )}
      </Flex>

      {/* Header Bagian Tengah: Navigasi Utama */}
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
          <Badge count={unread?.totalUnreadCount || 0}>
            <Button
              shape="circle"
              size="large"
              icon={<MessageFilled />}
              onClick={() => navigate("/chat")}
            />
          </Badge>

          <Notif user={user} />

          <Avatar
            size="large"
            icon={<UserOutlined />}
            src={user?.avatar}
            onClick={() => navigate(`/${user?.fullName}`)}
            style={{ cursor: "pointer" }}
          />
        </Flex>
      )}
    </div>
  );
};

export default Navbar;
