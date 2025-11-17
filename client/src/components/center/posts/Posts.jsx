import { Flex, Empty, Button, Typography, Spin } from "antd";
import PostCard from "./PostCard";
import AddPost from "./AddPost";
import { useGetFeedQuery } from "../../../service/post/ApiPost";
import { useNavigate } from "react-router-dom";
import { useEffect, useMemo } from "react";
import { useSocket } from "../../../context/SocketContext";
import SinglePost from "./SinglePost";

const { Title, Text } = Typography;

const Posts = ({ results, searchTerm, isLoadingSearch, postId }) => {
  const socket = useSocket();

  // Ini adalah state untuk FEED UTAMA
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

  if (postId) {
    return (
      <Flex vertical gap={"large"} style={{ width: "100%" }}>
        <SinglePost postId={postId} />
      </Flex>
    );
  }

  const renderFeedContent = () => {
    // --- JALUR 1: MODE PENCARIAN AKTIF ---
    if (searchTerm) {
      if (isLoadingSearch) {
        return (
          <Flex justify='center' align='center' style={{ minHeight: "200px" }}>
            <Spin size='large' />
          </Flex>
        );
      }

      if (!results || results.length === 0) {
        return (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Flex vertical align='center'>
                <Title level={4}>No results found for "{searchTerm}"</Title>
                <Text type='secondary'>
                  Please try again with different keywords.
                </Text>
              </Flex>
            }
          />
        );
      }

      // Tampilkan hasil pencarian
      return (
        <Flex vertical gap={"large"}>
          {results.map((post, index) => (
            <PostCard key={index} post={post} />
          ))}
        </Flex>
      );
    }

    // --- JALUR 2: MODE FEED NORMAL (TIDAK ADA PENCARIAN) ---
    // (Ini adalah logika asli Anda untuk feed)
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

    // Tampilkan feed normal
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
