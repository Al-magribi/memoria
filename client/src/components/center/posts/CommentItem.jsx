import { useState, useMemo } from "react";
import { Avatar, Button, Flex, Typography, Input, Modal, Dropdown } from "antd";
import { useSelector } from "react-redux";
import { ExclamationCircleOutlined, EllipsisOutlined } from "@ant-design/icons";
import {
  useUpdateCommentMutation,
  useDeleteCommentMutation,
  useAddReplyMutation,
  useUpdateReplyMutation,
  useDeleteReplyMutation,
} from "../../../service/post/ApiPost";
import TimeAgo from "javascript-time-ago";

const { Text, Paragraph } = Typography;

const CommentItem = ({ comment, postId }) => {
  const timeAgo = useMemo(() => new TimeAgo("id"), []);

  const { user } = useSelector((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(comment.text);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");

  const [updateComment] = useUpdateCommentMutation();
  const [deleteComment] = useDeleteCommentMutation();
  const [addReply] = useAddReplyMutation();

  const handleUpdate = async () => {
    try {
      await updateComment({ postId, commentId: comment.id, text: editedText });
      setIsEditing(false);
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
          await deleteComment({ postId, commentId: comment.id });
        } catch (error) {
          console.error("Failed to delete comment: ", error);
        }
      },
    });
  };

  const handleAddReply = async () => {
    if (replyText.trim()) {
      try {
        await addReply({ postId, commentId: comment.id, text: replyText });
        setReplyText("");
        setShowReplyInput(false);
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
    } else if (key === "delete") {
      handleDelete();
    }
  };

  return (
    <Flex gap='small' style={{ width: "100%" }}>
      <Avatar src={comment.avatar} />
      <Flex vertical style={{ width: "100%" }}>
        <div
          style={{
            backgroundColor: "#f0f2f5",
            borderRadius: "5px",
            padding: "8px 12px",
            position: "relative",
          }}
        >
          <Text strong>{comment.user}</Text>
          {isEditing ? (
            <Input.TextArea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              autoSize
            />
          ) : (
            <Paragraph style={{ margin: 0 }}>{comment.text}</Paragraph>
          )}
          {user?.username === comment.user && (
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
              <Button type='primary' size='small' onClick={handleUpdate}>
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
                {timeAgo.format(new Date(comment.timestamp))}
              </Text>
            </>
          )}
        </Flex>

        {comment.replies && comment.replies.length > 0 && (
          <div style={{ marginTop: "8px" }}>
            {comment.replies.map((reply) => (
              <ReplyItem
                key={reply.id}
                reply={reply}
                postId={postId}
                commentId={comment.id}
              />
            ))}
          </div>
        )}

        {showReplyInput && (
          <Flex gap='small' style={{ marginTop: "8px" }}>
            <Avatar src={user?.avatar} />
            <Input.TextArea
              autoSize={{ minRows: 1, maxRows: 4 }}
              placeholder='Write a reply...'
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <Button type='primary' onClick={handleAddReply}>
              Reply
            </Button>
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

const ReplyItem = ({ reply, postId, commentId }) => {
  const timeAgo = useMemo(() => new TimeAgo("id"), []);

  const { user } = useSelector((state) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(reply.text);

  const [updateReply] = useUpdateReplyMutation();
  const [deleteReply] = useDeleteReplyMutation();

  const handleUpdate = async () => {
    try {
      await updateReply({
        postId,
        commentId,
        replyId: reply.id,
        text: editedText,
      });
      setIsEditing(false);
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
          await deleteReply({ postId, commentId, replyId: reply.id });
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
    } else if (key === "delete") {
      handleDelete();
    }
  };

  return (
    <Flex gap='small' style={{ width: "100%", marginTop: "8px" }}>
      <Avatar src={reply.avatar} />
      <Flex vertical style={{ width: "100%" }}>
        <div
          style={{
            backgroundColor: "#f0f2f5",
            borderRadius: "10px",
            padding: "8px 12px",
            position: "relative",
          }}
        >
          <Text strong>{reply.user}</Text>
          {isEditing ? (
            <Input.TextArea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              autoSize
            />
          ) : (
            <Paragraph style={{ margin: 0 }}>{reply.text}</Paragraph>
          )}
          {user?.username === reply.user && (
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
              <Button type='primary' size='small' onClick={handleUpdate}>
                Save
              </Button>
              <Button size='small' onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <Text type='secondary' style={{ fontSize: "12px" }}>
              {timeAgo.format(new Date(reply.timestamp))}
            </Text>
          )}
        </Flex>
      </Flex>
    </Flex>
  );
};

export default CommentItem;
