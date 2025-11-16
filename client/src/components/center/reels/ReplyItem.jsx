import React, { useState, useMemo } from "react";
import { Avatar, Button, Flex, Typography, Input, Modal, Dropdown } from "antd";
import { useSelector } from "react-redux";
import {
  ExclamationCircleOutlined,
  EllipsisOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  useUpdateReplyMutation,
  useDeleteReplyMutation,
} from "../../../service/reel/ApiReel"; // Sesuaikan path jika perlu
import TimeAgo from "javascript-time-ago";

const { Text, Paragraph } = Typography;

const ReplayItem = ({ reply, reelId, commentId }) => {
  const timeAgo = useMemo(() => new TimeAgo("en"), []);
  const { user } = useSelector((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(reply.text);

  const [updateReply, { isLoading: isUpdating }] = useUpdateReplyMutation();
  const [deleteReply] = useDeleteReplyMutation();

  const handleUpdate = async () => {
    if (editedText.trim() === reply.text || !editedText.trim()) {
      setIsEditing(false); // "Tutup" mode edit jika tidak ada perubahan
      return;
    }
    try {
      await updateReply({
        reelId,
        commentId,
        replyId: reply._id,
        text: editedText,
      }).unwrap();
      setIsEditing(false); // "Tutup" mode edit setelah berhasil
    } catch (error) {
      console.error("Failed to update reply: ", error);
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Are you sure you want to delete this reply?",
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await deleteReply({ reelId, commentId, replyId: reply._id }).unwrap();
          // Modal konfirmasi "tertutup" otomatis
        } catch (error) {
          console.error("Failed to delete reply: ", error);
        }
      },
    });
  };

  const menuItems = [
    { key: "edit", label: "Edit" },
    { key: "delete", label: "Delete", danger: true },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "edit") {
      setIsEditing(true);
      setEditedText(reply.text);
    } else if (key === "delete") {
      handleDelete();
    }
  };

  return (
    <Flex gap='small' style={{ width: "100%", marginTop: "8px" }}>
      <Avatar src={reply.user?.avatar} icon={<UserOutlined />} />
      <Flex vertical style={{ width: "100%" }}>
        <div
          style={{
            backgroundColor: "#f0f2f5",
            borderRadius: "10px",
            padding: "8px 12px",
            position: "relative",
          }}
        >
          <Text strong>
            {reply.user?.fullName || reply.user?.firstName || "User"}
          </Text>
          {isEditing ? (
            <Input.TextArea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              autoSize
            />
          ) : (
            <Paragraph style={{ margin: 0 }}>{reply.text}</Paragraph>
          )}
          {user?._id === reply.user?._id && !isEditing && (
            <Dropdown
              menu={{ items: menuItems, onClick: handleMenuClick }}
              trigger={["click"]}
              placement='bottomRight'
            >
              <Button
                shape='circle'
                icon={<EllipsisOutlined />}
                size='small'
                style={{
                  position: "absolute",
                  top: 5,
                  right: 5,
                  background: "transparent",
                  border: "none",
                }}
              />
            </Dropdown>
          )}
        </div>
        <Flex align='center' gap='middle' style={{ padding: "8px 12px" }}>
          {isEditing ? (
            <>
              <Button
                type='primary'
                size='small'
                onClick={handleUpdate}
                loading={isUpdating}
              >
                Save
              </Button>
              <Button size='small' onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Text type='secondary' style={{ fontSize: "12px" }}>
              {timeAgo.format(new Date(reply.createdAt))}
            </Text>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default ReplayItem;
