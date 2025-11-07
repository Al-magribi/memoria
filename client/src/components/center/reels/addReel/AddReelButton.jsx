import { Button, Flex, Avatar } from "antd";
import { VideoCameraAddOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

const AddReelButton = ({ showModal }) => {
  const { user } = useSelector((state) => state.user);

  return (
    <Button
      onClick={showModal}
      shape="round"
      style={{
        flexGrow: 1,
        textAlign: "left",
        backgroundColor: "#f0f2f5",
        borderColor: "#f0f2f5",
        color: "#65676b",
        position: "absolute",
        bottom: 0,
        right: 0,
      }}
      icon={<VideoCameraAddOutlined />}
      type="text"
    >
      Create Reel
    </Button>
  );
};

export default AddReelButton;
