import { Flex, Empty, Button, Typography, Spin } from "antd";
import PostCard from "./PostCard";
import AddPost from "./AddPost";
import { useGetFeedQuery } from "../../../service/post/ApiPost";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useMemo } from "react";
import { io } from "socket.io-client";
import { useSocket } from "../../../context/SocketContext";

const { Title, Text } = Typography;

const Posts = () => {
  const socket = useSocket();
  const { user } = useSelector((state) => state.user);
  const { data: PostLists, isLoading, isError, refetch } = useGetFeedQuery();
  const navigate = useNavigate();

  useEffect(() => {
    if (socket) {
      const handlePost = () => {
        refetch();
      };
      socket.on("post", handlePost);

      return () => socket.off("post", handlePost);
    }
  }, [socket, refetch]);

  const renderFeedContent = () => {
    if (isLoading) {
      return (
        <Flex justify='center' align='center' style={{ minHeight: "200px" }}>
          <Spin size='large' />
        </Flex>
      );
    }

    if (isError) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Flex vertical align='center'>
              <Title level={4} type='danger'>
                Failed to load feed
              </Title>
              <Text type='secondary'>Please try again later.</Text>
            </Flex>
          }
        />
      );
    }

    if (!PostLists || PostLists.length === 0) {
      return (
        <Empty
          image='https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg'
          description={
            <Flex vertical align='center'>
              <Title level={4}>There are no posts yet</Title>
              <Text type='secondary'>
                Follow your friends to see their posts on your Feed
              </Text>
            </Flex>
          }
        >
          <Button type='primary' onClick={() => navigate("/friends")}>
            Find Friends
          </Button>
        </Empty>
      );
    }

    return (
      <Flex vertical gap={"large"}>
        {PostLists.map((post, index) => (
          <PostCard key={index} post={post} />
        ))}
      </Flex>
    );
  };

  return (
    <Flex vertical gap={"large"} style={{ width: "100%" }}>
      <AddPost />
      {renderFeedContent()}
    </Flex>
  );
};

export default Posts;
