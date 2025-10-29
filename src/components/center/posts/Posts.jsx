import { Flex } from "antd";
import PostCard from "./PostCard";
import { PostLists } from "../../../Dummies";
import AddPost from "./AddPost";

const Posts = () => {
  console.log(PostLists);
  return (
    <Flex vertical gap={"small"} style={{ width: "100%" }}>
      <AddPost />
      {PostLists?.map((post, index) => (
        <PostCard key={index} post={post} />
      ))}
    </Flex>
  );
};

export default Posts;
