import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Input,
  Row,
  message,
} from "antd";
import {
  VideoCameraOutlined,
  FileImageOutlined,
  PlayCircleOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";

const AddPostButton = ({ showModal }) => {
  const { user } = useSelector((state) => state.user);

  return (
    <Card>
      <Flex align='center' justify='space-between'>
        <Avatar
          icon={<UserOutlined />}
          src={user?.avatar}
          size='large'
          shape='circle'
        />
        <Input
          placeholder={`What's on your mind, ${user?.username}?`}
          onClick={showModal}
          readOnly
          style={{
            cursor: "pointer",
            backgroundColor: "#f0f2f5",
            borderRadius: "20px",
            width: "90%",
          }}
        />
      </Flex>
    </Card>
  );
};

export default AddPostButton;
