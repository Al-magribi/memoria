import { Avatar, List, Badge } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useGetOnlineFriendsQuery } from "../../service/friends/ApiFriend";
import { useEffect } from "react";
import { useSocket } from "../../context/SocketContext";
import { useGetUnreadQuery } from "../../service/chat/ApiChat";

// Terima prop 'onContactClick'
const ContactList = ({ onContactClick }) => {
  const socket = useSocket();
  const { data, isLoading, refetch } = useGetOnlineFriendsQuery();

  const { data: unread } = useGetUnreadQuery(); // 'contact' berisi array unreadConversations

  const contact = unread?.unreadConversations; // Hapus console.log jika sudah tidak diperlukan // console.log(contact); // console.log(data);

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
      header={"Online Friends"}
      dataSource={data} // Tampilkan loading skeleton saat data diambil
      loading={isLoading}
      renderItem={(item) => {
        // --- LOGIKA BARU DIMULAI ---
        // 1. Cari data unread yang sesuai untuk kontak (item) ini
        // Kita cocokkan item.id (dari list teman) dengan c.participant._id (dari list unread)
        // 'contact' bisa jadi undefined, jadi kita gunakan optional chaining 'contact?.'
        const unreadInfo = contact?.find((c) => c.participant._id === item.id); // 2. Ambil unreadCount-nya. Jika tidak ada, 0.

        const count = unreadInfo ? unreadInfo.unreadCount : 0; // --- LOGIKA BARU SELESAI ---
        return (
          <List.Item
            onClick={() => onContactClick(item)} // Panggil fungsi dari parent
            style={{ cursor: "pointer" }}
          >
            <List.Item.Meta
              avatar={
                <Avatar
                  icon={<UserOutlined />}
                  src={item.avatar}
                  size={"large"}
                />
              }
              title={item.fullName}
              description={count > 0 && `${count} unread messages`}
            />
          </List.Item>
        );
      }}
    />
  );
};

export default ContactList;
