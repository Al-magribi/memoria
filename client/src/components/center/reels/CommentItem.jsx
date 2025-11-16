import React, { useState, useMemo } from "react";
import { Avatar, Button, Flex, Typography, Input, Modal, Dropdown } from "antd";
import { useSelector } from "react-redux";
import {
  ExclamationCircleOutlined,
  EllipsisOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useAddReplyMutation,
} from "../../../service/reel/ApiReel"; // Sesuaikan path jika perlu
import TimeAgo from "javascript-time-ago";
import ReplayItem from "./ReplyItem";

TimeAgo.addDefaultLocale(id);

const { Text, Paragraph } = Typography;

const CommentItem = ({ comment, reelId }) => {
  const timeAgo = useMemo(() => new TimeAgo("en"), []);
  const { user } = useSelector((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");

  const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [addReply, { isLoading: isReplying }] = useAddReplyMutation();

  const handleUpdate = async () => {
    if (editedText.trim() === comment.text || !editedText.trim()) {
      setIsEditing(false); // "Tutup" mode edit jika tidak ada perubahan
      return;
    }
    try {
      await updateComment({
        reelId,
        commentId: comment._id,
        text: editedText,
      }).unwrap();
      setIsEditing(false); // "Tutup" mode edit setelah berhasil
    } catch (error) {
      console.error("Failed to update comment: ", error);
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Are you sure you want to delete this comment?",
      icon: <ExclamationCircleOutlined />,
      onOk: async () => {
        try {
          await deleteComment({ reelId, commentId: comment._id }).unwrap();
          // Modal konfirmasi "tertutup" otomatis
        } catch (error) {
          console.error("Failed to delete comment: ", error);
        }
      },
    });
  };

  const handleAddReply = async () => {
    if (replyText.trim()) {
      try {
        await addReply({
          reelId,
          commentId: comment._id,
          text: replyText,
        }).unwrap();
        setReplyText(""); // "Tutup" input reply dengan mengosongkan teks
        setShowReplyInput(false); // dan menyembunyikan input
      } catch (error) {
        console.error("Failed to add reply: ", error);
      }
    }
  };

  const menuItems = [
    { key: "edit", label: "Edit" },
    { key: "delete", label: "Delete", danger: true },
  ];

  const handleMenuClick = ({ key }) => {
    if (key === "edit") {
      setIsEditing(true);
      setEditedText(comment.text);
    } else if (key === "delete") {
      handleDelete();
    }
  };

  return (
    <Flex gap='small' style={{ width: "100%" }}>
      <Avatar src={comment.user?.avatar} icon={<UserOutlined />} />
      <Flex vertical style={{ width: "100%" }}>
        <div
          style={{
            backgroundColor: "#f0f2f5",
            borderRadius: "5px",
            padding: "8px 12px",
            position: "relative",
          }}
        >
          <Text strong>
            {comment.user?.fullName || comment.user?.firstName || "User"}
          </Text>
          {isEditing ? (
            <Input.TextArea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              autoSize
            />
          ) : (
            <Paragraph style={{ margin: 0 }}>{comment.text}</Paragraph>
          )}
          {user?._id === comment.user?._id && !isEditing && (
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
            <>
              <Button
                type='text'
                size='small'
                onClick={() => setShowReplyInput(!showReplyInput)}
              >
                Reply
              </Button>
              <Text type='secondary' style={{ fontSize: "12px" }}>
                {timeAgo.format(new Date(comment.createdAt))}
              </Text>
            </>
          )}
        </Flex>

        {/* Tampilkan Balasan */}
        {comment.replies && comment.replies.length > 0 && (
          <div style={{ marginLeft: "16px" }}>
            {comment.replies.map((reply) => (
              <ReplayItem
                key={reply._id}
                reply={reply}
                reelId={reelId}
                commentId={comment._id}
              />
            ))}
          </div>
        )}

        {/* Input untuk Balasan */}
        {showReplyInput && (
          <Flex gap='small' style={{ marginTop: "8px", marginLeft: "16px" }}>
            <Avatar src={user?.avatar} icon={<UserOutlined />} />
            <Input.TextArea
              autoSize={{ minRows: 1, maxRows: 4 }}
              placeholder='Write a reply...'
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <Button
              type='primary'
              onClick={handleAddReply}
              loading={isReplying}
            >
              Reply
            </Button>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default CommentItem;
