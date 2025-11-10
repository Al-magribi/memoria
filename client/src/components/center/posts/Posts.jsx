import { Flex, Empty, Button, Typography, Spin } from "antd";
import PostCard from "./PostCard";
import AddPost from "./AddPost";
import { useGetFeedQuery } from "../../../service/post/ApiPost";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import { io } from "socket.io-client";
import { useSocket } from "../../../context/SocketContext";

const { Title, Text } = Typography;

const Posts = () => {
  const socket = useSocket();
  const { user } = useSelector((state) => state.user);
  // Ambil juga state isError untuk penanganan error
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

  // Fungsi untuk merender konten berdasarkan state
  const renderFeedContent = () => {
    // 1. Prioritaskan Loading State
    // Tampilkan spinner di tengah, bukan membungkus komponen Empty
    if (isLoading) {
      return (
        <Flex justify="center" align="center" style={{ minHeight: "200px" }}>
          <Spin size="large" />
        </Flex>
      );
    }

    // 2. Handle Error State
    if (isError) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={
            <Flex vertical align="center">
              <Title level={4} type="danger">
                Failed to load feed
              </Title>
              <Text type="secondary">Please try again later.</Text>
            </Flex>
          }
        />
      );
    }

    // 3. Handle Empty State (Setelah loading selesai dan tidak error)
    if (!PostLists || PostLists.length === 0) {
      return (
        <Empty
          image="https://gw.alipayobjects.com/zos/antfincdn/ZHrcdLPrvN/empty.svg"
          description={
            <Flex vertical align="center">
              <Title level={4}>There are no posts yet</Title>
              <Text type="secondary">
                Follow your friends to see their posts on your Feed
              </Text>
            </Flex>
          }
        >
          <Button type="primary" onClick={() => navigate("/friends")}>
            Find Friends
          </Button>
        </Empty>
      );
    }

    // 4. Handle Data State
    return (
      <Flex vertical gap={"large"}>
        {PostLists.map((post, index) => (
          // Prop isLoading tidak lagi diperlukan di sini
          <PostCard key={index} post={post} />
        ))}
      </Flex>
    );
  };

  return (
    <Flex vertical gap={"large"} style={{ width: "100%" }}>
      {/* AddPost tetap di luar agar selalu terlihat */}
      <AddPost />

      {/* Render konten feed berdasarkan state */}
      {renderFeedContent()}
    </Flex>
  );
};

export default Posts;
