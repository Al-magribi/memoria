import { useState, useMemo } from "react";
import {
  Avatar,
  Card,
  Flex,
  Button,
  Typography,
  Divider,
  Dropdown,
  Tag,
  Space,
  message,
} from "antd";
import {
  LikeOutlined,
  LikeFilled,
  MessageOutlined,
  ShareAltOutlined,
  EllipsisOutlined,
  UserOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import CommentSection from "./CommentSection";
import MediaGrid from "./MediaGrid";
import TimeAgo from "javascript-time-ago";
import { useSelector } from "react-redux";
import AddPost from "./AddPost";

import {
  useDeletePostMutation,
  useLikePostMutation,
} from "../../../service/post/ApiPost";
import { Modal } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";

const { Title, Text, Paragraph } = Typography;

const PostCard = ({ post, isLoading }) => {
  const timeAgo = useMemo(() => new TimeAgo("en"), []);

  const { user } = useSelector((state) => state.user);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletePost] = useDeletePostMutation();
  const [likePost] = useLikePostMutation();

  const handleDelete = () => {
    Modal.confirm({
      title: "Are you sure you want to delete this post?",
      icon: <ExclamationCircleOutlined />,
      content: "This action cannot be undone.",
      onOk: async () => {
        try {
          await deletePost(post.id).unwrap();
        } catch (error) {
          console.error("Failed to delete the post: ", error);
        }
      },
    });
  };

  const handleMenuClick = ({ key }) => {
    if (key === "edit") {
      setIsEditModalOpen(true);
    } else if (key === "delete") {
      handleDelete();
    }
  };

  const menuItems = [
    { key: "save", label: "Save Post" },
    { key: "report", label: "Report Post" },
  ];

  if (user && post.user && user._id === post.user._id) {
    menuItems.unshift({ key: "edit", label: "Edit Post" });
    menuItems.push({ key: "delete", label: "Delete Post", danger: true });
  }

  const [showComments, setShowComments] = useState(false);

  const handleLikeClick = () => {
    likePost(post.id);
  };

  const handleCommentClick = () => {
    setShowComments(!showComments);
  };

  const handleShareClick = () => {
    const shareUrl = `${window.location.origin}?postId=${post.id}`;
    navigator.clipboard.writeText(shareUrl);
  };

  const ActionButton = ({ icon, text, onClick, active }) => (
    <Button
      type='text'
      icon={icon}
      onClick={onClick}
      style={{
        width: "100%",
        color: active ? "#1890ff" : "inherit",
      }}
    >
      {text}
    </Button>
  );

  return (
    <>
      <Card loading={isLoading}>
        <Flex justify='space-between' align='center'>
          <Flex gap={"middle"}>
            <Avatar icon={<UserOutlined />} src={post.avatar} size={40} />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Space>
                <Title style={{ margin: 0 }} level={5} ellipsis>
                  {post.fullName}
                </Title>
                {post.location?.display_name && (
                  <Tag>
                    <EnvironmentOutlined />{" "}
                    {post.location.display_name?.split(",")[0]}
                  </Tag>
                )}
              </Space>
              <Text type='secondary'>
                {timeAgo.format(new Date(post.timestamp))}
              </Text>
            </div>
          </Flex>

          <Dropdown
            menu={{ items: menuItems, onClick: handleMenuClick }}
            placement='bottomRight'
            arrow
          >
            <Button
              type='text'
              shape='circle'
              icon={<EllipsisOutlined style={{ fontSize: "20px" }} />}
            />
          </Dropdown>
        </Flex>

        <Paragraph style={{ marginTop: 16 }}>{post.content}</Paragraph>

        <MediaGrid images={post.images} videos={post.videos} />

        <Flex justify='space-between' style={{ marginTop: 16 }}>
          <Flex align='center' gap={4}>
            <LikeFilled style={{ color: "#1890ff" }} />
            <Text type='secondary'>{post.likes}</Text>
          </Flex>
          <Text type='secondary'>
            {post.comments > 0 && `${post.comments} comments`}
            {post.comments > 0 && post.shares > 0 && " · "}
            {post.shares > 0 && `${post.shares} shares`}
          </Text>
        </Flex>

        <Divider style={{ margin: "8px 0" }} />

        <Flex>
          <ActionButton
            icon={post.isLiked ? <LikeFilled /> : <LikeOutlined />}
            text='Like'
            onClick={handleLikeClick}
            active={post.isLiked}
          />
          <ActionButton
            icon={<MessageOutlined />}
            text='Comment'
            onClick={handleCommentClick}
          />
          <ActionButton
            icon={<ShareAltOutlined />}
            text='Share'
            onClick={handleShareClick}
          />
        </Flex>

        {showComments && (
          <CommentSection postId={post.id} comments={post.commentsData} />
        )}
      </Card>
      {isEditModalOpen && (
        <AddPost
          postToEdit={post}
          isModalOpen={isEditModalOpen}
          handleCancel={() => setIsEditModalOpen(false)}
        />
      )}
    </>
  );
};

export default PostCard;
