import Stories from "./Stories";
import PostAdd from "./PostAdd";
import PostLists from "./PostLists";
import "./post.scss";

const Post = () => {
  return (
    <div className='flex-2 d-flex flex-column post'>
      <PostAdd />

      <Stories />

      <PostLists />
    </div>
  );
};

export default Post;
