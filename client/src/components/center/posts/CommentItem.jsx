import { useState } from "react";
import { Avatar, Button, Flex, Typography, Input } from "antd";
import { LikeFilled, LikeOutlined } from "@ant-design/icons";

const { Text, Paragraph } = Typography;

const CommentItem = ({ comment }) => {
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(comment.likes);
  const [showReplyInput, setShowReplyInput] = useState(false);

  const handleLike = () => {
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    setIsLiked(!isLiked);
  };

  return (
    <Flex gap='small' style={{ width: "100%" }}>
      <Avatar src={comment.avatar} />
      <Flex vertical style={{ width: "100%" }}>
        {/* Kotak bubble untuk komentar */}
        <div
          style={{
            backgroundColor: "#f0f2f5",
            borderRadius: "18px",
            padding: "8px 12px",
          }}
        >
          <Text strong>{comment.user}</Text>
          <Paragraph style={{ margin: 0 }}>{comment.text}</Paragraph>
        </div>

        {/* Tombol Aksi di bawah bubble */}
        <Flex align='center' gap='middle' style={{ padding: "0 12px" }}>
          <Button
            type='text'
            size='small'
            onClick={handleLike}
            style={{
              fontWeight: isLiked ? "bold" : "normal",
              color: isLiked ? "#1890ff" : "inherit",
            }}
          >
            Like
          </Button>
          <Button
            type='text'
            size='small'
            onClick={() => setShowReplyInput(!showReplyInput)}
          >
            Reply
          </Button>
          <Text type='secondary' style={{ fontSize: "12px" }}>
            {comment.timestamp}
          </Text>
          {likeCount > 0 && (
            <Flex
              align='center'
              gap={4}
              style={{ marginLeft: "auto", fontSize: "12px" }}
            >
              <LikeFilled style={{ color: "#1890ff" }} />
              <Text type='secondary'>{likeCount}</Text>
            </Flex>
          )}
        </Flex>

        {/* Tampilkan balasan (rekursif) */}
        {comment.replies && comment.replies.length > 0 && (
          <div style={{ marginTop: "8px" }}>
            {comment.replies.map((reply) => (
              <CommentItem key={reply.id} comment={reply} />
            ))}
          </div>
        )}

        {/* Input untuk membalas komentar */}
        {showReplyInput && (
          <Flex gap='small' style={{ marginTop: "8px" }}>
            <Avatar src='https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg' />
            <Input.TextArea
              autoSize={{ minRows: 2, maxRows: 4 }}
              placeholder='Write a reply...'
            />
          </Flex>
        )}
      </Flex>
    </Flex>
  );
};

export default CommentItem;
