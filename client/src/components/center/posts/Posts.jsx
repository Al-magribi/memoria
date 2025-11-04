import { Flex } from "antd";
import PostCard from "./PostCard";
import AddPost from "./AddPost";
import { useGetFeedQuery } from "../../../service/post/ApiPost";

const Posts = () => {
  const { data: PostLists, isLoading } = useGetFeedQuery();

  console.log(PostLists);

  return (
    <Flex vertical gap={"small"} style={{ width: "100%" }}>
      <AddPost />
      {PostLists?.map((post, index) => (
        <PostCard key={index} post={post} isLoading={isLoading} />
      ))}
    </Flex>
  );
};

export default Posts;
