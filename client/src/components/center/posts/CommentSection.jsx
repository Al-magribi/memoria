import { Avatar, Flex, Input, Divider, Button } from "antd";
import CommentItem from "./CommentItem"; // Import komponen yang baru dibuat
import { useSelector } from "react-redux";
import { UserOutlined } from "@ant-design/icons";
import { useAddCommentMutation } from "../../../service/post/ApiPost";
import { useState } from "react";

const CommentSection = ({ comments, postId }) => {
  const { user } = useSelector((state) => state.user);
  const [addComment, { isLoading }] = useAddCommentMutation();
  const [commentText, setCommentText] = useState("");

  const handleAddComment = async () => {
    if (commentText.trim()) {
      try {
        await addComment({ postId, text: commentText }).unwrap();
        setCommentText("");
      } catch (error) {
        console.error("Failed to add comment: ", error);
      }
    }
  };

  return (
    <Flex
      vertical
      gap='middle'
      style={{ width: "100%", padding: "0 16px 16px 16px" }}
    >
      <Divider style={{ margin: "8px 0" }} />

      {/* Input untuk menulis komentar baru */}
      <Flex
        align='start'
        justify='start'
        gap={"small"}
        style={{ width: "100%" }}
      >
        <Avatar src={user?.avatar} icon={<UserOutlined />} />

        <Flex vertical align='end' gap='small' style={{ width: "100%" }}>
          <Input.TextArea
            placeholder='Write a comment...'
            autoSize={{ minRows: 2, maxRows: 6 }}
            style={{ borderRadius: "10px" }}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <Button type='primary' onClick={handleAddComment} loading={isLoading}>
            Post
          </Button>
        </Flex>
      </Flex>

      {/* Daftar komentar */}
      {comments?.map((comment) => (
        <CommentItem key={comment.id} comment={comment} postId={postId} />
      ))}
    </Flex>
  );
};

export default CommentSection;
