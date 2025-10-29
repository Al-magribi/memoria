import { Avatar, Flex, Input, Divider, Button } from "antd";
import CommentItem from "./CommentItem"; // Import komponen yang baru dibuat

const CommentSection = ({ comments }) => {
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
        <Avatar src='https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg' />

        <Flex vertical align='end' gap='small' style={{ width: "100%" }}>
          <Input.TextArea
            placeholder='Write a comment...'
            autoSize={{ minRows: 2, maxRows: 6 }}
            style={{ borderRadius: "10px" }}
          />
          <Button type='primary'>Post</Button>
        </Flex>
      </Flex>

      {/* Daftar komentar */}
      {comments?.map((comment) => (
        <CommentItem key={comment.id} comment={comment} />
      ))}
    </Flex>
  );
};

export default CommentSection;
