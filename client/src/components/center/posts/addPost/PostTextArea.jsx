import { Input } from "antd";
import { useSelector } from "react-redux";

const { TextArea } = Input;

const PostTextArea = ({ postText, setPostText }) => {
  const { user } = useSelector((state) => state.user);

  return (
    <TextArea
      value={postText}
      onChange={(e) => setPostText(e.target.value)}
      rows={5}
      placeholder={`What\'s on your mind, ${user?.fullName}?`}
      variant='borderless'
      style={{
        fontSize: "1.2rem",
        padding: "10px 0",
        maxHeight: 200,
        overflowY: "auto",
      }}
    />
  );
};

export default PostTextArea;
