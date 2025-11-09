import {
  useGetNotifQuery,
  useMarkAsReadMutation,
  useDeleteNotifMutation,
  useMarkAllAsReadMutation,
} from "../../service/notif/ApiNotif";
import { Avatar, List, Button, Dropdown, Badge, Spin, Empty, Flex } from "antd";
import { BellFilled, DeleteOutlined, CheckOutlined } from "@ant-design/icons";
import { useEffect } from "react";
import io from "socket.io-client";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { useSocket } from "../../context/SocketContext";
dayjs.extend(relativeTime);

const Notif = ({ user }) => {
  const socket = useSocket();
  const navigate = useNavigate();
  const {
    data: notifications,
    refetch,
    isLoading,
  } = useGetNotifQuery(undefined, {
    skip: !user,
  });
  const [markAsRead] = useMarkAsReadMutation();
  const [deleteNotif] = useDeleteNotifMutation();
  const [markAllAsRead] = useMarkAllAsReadMutation();

  useEffect(() => {
    // 1. Cukup periksa 'socket'. 'user' sudah diurus oleh Context.
    if (socket) {
      // 2. Buat handler agar bisa digunakan di 'off'
      const handleNotification = () => {
        refetch();
      };

      socket.on("notification", handleNotification);

      // 3. Cleanup HANYA 'listener', JANGAN 'disconnect'
      return () => {
        socket.off("notification", handleNotification);
      };
    }
    // 4. Ubah dependensi dari 'user' ke 'socket'
  }, [socket, refetch]);

  const handleNotificationClick = async (item) => {
    if (!item.read) {
      await markAsRead(item._id);
    }
    if (item.type === "friend_request_accepted") {
      navigate(`/${item.sender.fullName}`);
    } else if (item.targetPost) {
      navigate(`/posts/${item.targetPost}`);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    await deleteNotif(id);
  };

  const handleMarkAllRead = async (e) => {
    e.stopPropagation();
    await markAllAsRead();
  };

  const notificationMenu = (
    <div
      style={{
        backgroundColor: "#ffffff",
        borderRadius: "8px",
        boxShadow:
          "0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 9px 28px 8px rgba(0, 0, 0, 0.05)",
        width: 350,
        maxHeight: 400,
        overflowY: "auto",
      }}
    >
      <Flex
        justify='space-between'
        align='center'
        style={{ padding: "12px 16px", borderBottom: "1px solid #f0f0f0" }}
      >
        <h3 style={{ margin: 0 }}>Notifications</h3>
        <Button
          type='link'
          onClick={handleMarkAllRead}
          icon={<CheckOutlined />}
        >
          Mark all as read
        </Button>
      </Flex>
      {isLoading ? (
        <div style={{ padding: "20px", textAlign: "center" }}>
          <Spin />
        </div>
      ) : notifications && notifications.length > 0 ? (
        <List
          itemLayout='horizontal'
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              onClick={() => handleNotificationClick(item)}
              style={{
                padding: "12px 16px",
                cursor: "pointer",
                backgroundColor: item.read ? "transparent" : "#e6f7ff",
              }}
              actions={[
                <Button
                  type='text'
                  danger
                  icon={<DeleteOutlined />}
                  onClick={(e) => handleDelete(item._id, e)}
                />,
              ]}
            >
              <List.Item.Meta
                avatar={<Avatar src={item.sender.avatar} />}
                title={
                  <Flex justify='space-between'>
                    <span>{item.sender.fullName}</span>
                    <span style={{ fontSize: "12px", color: "#888" }}>
                      {dayjs(item.createdAt).fromNow()}
                    </span>
                  </Flex>
                }
                description={item.type.replace(/_/g, " ")}
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description='No new notifications' style={{ padding: "20px" }} />
      )}
    </div>
  );

  return (
    <Dropdown popupRender={() => notificationMenu} trigger={["click"]}>
      <Badge count={notifications?.filter((n) => !n.read).length}>
        <Button shape='circle' size='large' icon={<BellFilled />} />
      </Badge>
    </Dropdown>
  );
};

export default Notif;
