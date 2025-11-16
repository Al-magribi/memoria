import React, { useState } from "react";
import { Modal, Avatar, Button, Flex, Input, Empty, Divider } from "antd";
import { useSelector } from "react-redux";
import { UserOutlined } from "@ant-design/icons";
import { useAddCommentMutation } from "../../../service/reel/ApiReel"; // Sesuaikan path jika perlu
import CommentItem from "./CommentItem";

// Komponen Modal Utama
const Comment = ({ reel, open, onClose }) => {
  const { user } = useSelector((state) => state.user);
  const [addComment, { isLoading }] = useAddCommentMutation();
  const [commentText, setCommentText] = useState("");

  const handleAddComment = async () => {
    if (commentText.trim()) {
      try {
        await addComment({ reelId: reel._id, text: commentText }).unwrap();
        setCommentText(""); // "Tutup" input dengan mengosongkan teks
      } catch (error) {
        console.error("Failed to add comment: ", error);
      }
    }
  };

  return (
    <Modal
      title={`${reel.comments?.length || 0} Comments`}
      open={open}
      onCancel={onClose}
      footer={null} // Hapus footer bawaan
      width={600} // Atur lebar modal
    >
      <Flex
        vertical
        gap='middle'
        style={{
          maxHeight: "60vh", // Batasi tinggi area komentar
          overflowY: "auto", // Buat bisa di-scroll
          padding: "16px 4px",
        }}
      >
        {reel.comments?.length > 0 ? (
          reel.comments.map((comment) => (
            <CommentItem
              key={comment._id}
              comment={comment}
              reelId={reel._id}
            />
          ))
        ) : (
          <Empty description='No comments yet. Be the first to comment!' />
        )}
      </Flex>

      {/* Input untuk menambah komentar baru */}
      <Divider style={{ margin: "16px 0 8px 0" }} />
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
            autoSize={{ minRows: 1, maxRows: 4 }}
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
          />
          <Button type='primary' onClick={handleAddComment} loading={isLoading}>
            Post
          </Button>
        </Flex>
      </Flex>
    </Modal>
  );
};

export default Comment;
