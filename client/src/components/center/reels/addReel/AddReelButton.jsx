import { Button, Flex, Avatar } from "antd";
import { VideoCameraAddOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

const AddReelButton = ({ showModal }) => {
  const { user } = useSelector((state) => state.user);

  return (
    <Flex
      style={{
        padding: "1rem",
        borderBottom: "1px solid #dbdbdb",
        backgroundColor: "#fff",
        borderTopLeftRadius: "8px",
        borderTopRightRadius: "8px",
      }}
    >
      <Avatar src={user?.avatar} style={{ marginRight: "1rem" }} />
      <Button
        onClick={showModal}
        shape='round'
        style={{
          flexGrow: 1,
          textAlign: "left",
          backgroundColor: "#f0f2f5",
          borderColor: "#f0f2f5",
          color: "#65676b",
        }}
        icon={<VideoCameraAddOutlined />}
        type='text'
      >
        Create Reel
      </Button>
    </Flex>
  );
};

export default AddReelButton;
