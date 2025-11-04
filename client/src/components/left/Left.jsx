import { Menu, Avatar } from "antd";
import {
  UsergroupAddOutlined,
  PlaySquareOutlined,
  UserOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router-dom";

const Left = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick = (e) => {
    // e.key akan berisi path yang kita atur di 'items'
    navigate(e.key);
  };

  return (
    <Menu
      mode='inline'
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
      ]}
    />
  );
};

export default Left;
