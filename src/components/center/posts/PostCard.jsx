import { useState } from "react";
import {
  Avatar,
  Card,
  Flex,
  Button,
  Typography,
  Divider,
  Dropdown,
} from "antd";
import {
  LikeOutlined,
  LikeFilled,
  MessageOutlined,
  ShareAltOutlined,
  EllipsisOutlined,
  UserOutlined,
} from "@ant-design/icons";
import CommentSection from "./CommentSection";
import MediaGrid from "./MediaGrid";

const { Meta } = Card;
const { Title, Text, Paragraph } = Typography;

// Menu untuk tombol titik tiga (more options)
const items = [
  { key: "1", label: "Save Post" },
  { key: "2", label: "Report Post" },
  { key: "3", label: "Hide Post", danger: true },
];

const PostCard = ({ post }) => {
  // State untuk melacak status 'like' dan jumlahnya
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [showComments, setShowComments] = useState(false);

  // Fungsi untuk handle klik tombol like
  const handleLikeClick = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleCommentClick = () => {
    setShowComments(!showComments); // Toggle visibilitas
  };

  // Komponen untuk tombol Aksi (Like, Comment, Share)
  const ActionButton = ({ icon, text, onClick, active }) => (
    <Button
      type='text'
      icon={icon}
      onClick={onClick}
      style={{
        width: "100%",
        color: active ? "#1890ff" : "inherit", // Warna biru jika aktif
      }}
    >
      {text}
    </Button>
  );

  return (
    <Card>
      {/* Header Kartu: Avatar, Nama, Waktu, dan Tombol Opsi */}
      <Flex justify='space-between' align='center'>
        <Flex gap={"middle"}>
          <Avatar icon={<UserOutlined />} src={post.avatar} />
          <div>
            <Title style={{ margin: 0 }} level={5} ellipsis>
              {post.username}
            </Title>
            <Text type='secondary'>{post.timestamp}</Text>
          </div>
        </Flex>

        <Dropdown menu={{ items }} placement='bottomRight' arrow>
          <Button
            type='text'
            shape='circle'
            icon={<EllipsisOutlined style={{ fontSize: "20px" }} />}
          />
        </Dropdown>
      </Flex>

      {/* Konten Postingan */}
      <Paragraph style={{ marginTop: 16 }}>{post.content}</Paragraph>

      {/* Videos dan photos */}
      <MediaGrid images={post.images} videos={post.videos} />

      {/* Info Jumlah Like, Comment, Share */}
      <Flex justify='space-between' style={{ marginTop: 16 }}>
        <Flex align='center' gap={4}>
          <LikeFilled style={{ color: "#1890ff" }} />
          <Text type='secondary'>{likeCount}</Text>
        </Flex>
        <Text type='secondary'>
          {/* Tampilkan comments HANYA jika lebih dari 0 */}
          {post.comments > 0 && `${post.comments} comments`}

          {/* Tampilkan pemisah "·" HANYA jika KEDUANYA lebih dari 0 */}
          {post.comments > 0 && post.shares > 0 && " · "}

          {/* Tampilkan shares HANYA jika lebih dari 0 */}
          {post.shares > 0 && `${post.shares} shares`}
        </Text>
      </Flex>

      <Divider style={{ margin: "8px 0" }} />

      {/* Tombol Aksi: Like, Comment, Share */}
      <Flex>
        <ActionButton
          icon={isLiked ? <LikeFilled /> : <LikeOutlined />}
          text='Like'
          onClick={handleLikeClick}
          active={isLiked}
        />
        <ActionButton
          icon={<MessageOutlined />}
          text='Comment'
          onClick={handleCommentClick}
        />
        <ActionButton icon={<ShareAltOutlined />} text='Share' />
      </Flex>

      {showComments && <CommentSection comments={post.commentsData} />}
    </Card>
  );
};

export default PostCard;
