import { Flex, Empty, Button, Typography, Spin } from "antd";
import PostCard from "./PostCard";
import AddPost from "./AddPost";
import { useGetFeedQuery } from "../../../service/post/ApiPost";
import { useNavigate } from "react-router-dom";

const { Title, Text } = Typography;

const Posts = () => {
  const { data: PostLists, isLoading } = useGetFeedQuery();
  const navigate = useNavigate();

  return (
    <Flex vertical gap={"large"} style={{ width: "100%" }}>
      <AddPost />

      <Spin tip='Loading Feed...' spinning={isLoading}>
        <Flex vertical gap={"large"}>
          {PostLists && PostLists.length > 0 ? (
            PostLists.map((post, index) => (
              <PostCard key={index} post={post} isLoading={isLoading} />
            ))
          ) : (
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
          )}
        </Flex>
      </Spin>
    </Flex>
  );
};

export default Posts;
