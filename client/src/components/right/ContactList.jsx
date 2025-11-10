import { Avatar, List, Badge } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Contacts } from "../../Dummies"; // Pastikan path ini benar
import { useGetOnlineFriendsQuery } from "../../service/friends/ApiFriend";
import { useEffect } from "react";
import { useSocket } from "../../context/SocketContext";

// Terima prop 'onContactClick'
const ContactList = ({ onContactClick }) => {
  const socket = useSocket();
  const { data, isLoading, refetch } = useGetOnlineFriendsQuery();

  useEffect(() => {
    if (socket) {
      const handleRefetch = () => {
        refetch();
      };

      socket.on("status", handleRefetch);

      return () => socket.off("status", handleRefetch);
    }
  }, [socket, refetch]);

  return (
    <List
      header={"Contacts"}
      dataSource={data}
      renderItem={(item) => (
        // Tambahkan event onClick pada setiap List.Item
        <List.Item
          onClick={() => onContactClick(item)} // Panggil fungsi dari parent
          style={{ cursor: "pointer" }}
          className="contact-item" // Tambahkan class untuk efek hover
        >
          <List.Item.Meta
            avatar={
              <Badge dot color={item.isLogin ? "green" : "gray"}>
                <Avatar icon={<UserOutlined />} src={item.avatar} />
              </Badge>
            }
            title={item.fullName}
          />
        </List.Item>
      )}
    />
  );
};

export default ContactList;
