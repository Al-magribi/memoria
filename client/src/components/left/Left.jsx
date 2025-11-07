import { Menu, Avatar, Spin, message } from "antd";
import {
  UsergroupAddOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";
import { useLogoutMutation } from "../../service/user/ApiUser";
import { useEffect } from "react";

const Left = ({ user, isLoading }) => {
  const [logout, { isSuccess, data }] = useLogoutMutation();
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = (e) => {
    if (e.key === "/logout") {
      logout();
      return;
    }
    navigate(e.key);
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(data.message);
      window.location.href = "/signin";
    }
  }, [isSuccess, data]);

  return (
    <Spin tip="Loading Profile..." spinning={isLoading}>
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        onClick={handleMenuClick}
        style={{ backgroundColor: "#f0f2f5", border: "none" }}
        items={[
          {
            // 7. Gunakan path sebagai 'key' agar semantik
            key: `/${user?.username}`,
            icon: <Avatar icon={<UserOutlined />} src={user?.avatar} />,
            label: `@${user?.username}`,
            // Hapus onClick individual
          },
          {
            key: "/friends", // 7. Gunakan path sebagai 'key'
            icon: <UsergroupAddOutlined />,
            label: "Friends",
          },
          {
            key: "/settings", // 7. Gunakan path sebagai 'key'
            icon: <SettingOutlined />,
            label: "Settings",
          },
          {
            key: "/logout", // 7. Gunakan path sebagai 'key'
            icon: <LogoutOutlined />,
            label: "logout",
            danger: true,
          },
        ]}
      />
    </Spin>
  );
};

export default Left;
