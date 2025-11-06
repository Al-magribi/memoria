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
      <Flex align="center" justify="space-between">
        <Avatar
          icon={<UserOutlined />}
          src={user?.avatar}
          size="large"
          shape="circle"
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
      <Divider style={{ margin: "12px 0" }} />
      <Row gutter={[8, 8]}>
        <Col xs={8} style={{ textAlign: "center" }}>
          <Button
            type="text"
            icon={<VideoCameraOutlined style={{ color: "red" }} />}
            style={{ width: "100%" }}
            onClick={() => message.info("Live video feature is coming soon!")}
          >
            Live
          </Button>
        </Col>
        <Col xs={8} style={{ textAlign: "center" }}>
          <Button
            type="text"
            icon={<FileImageOutlined style={{ color: "green" }} />}
            style={{ width: "100%" }}
            onClick={showModal}
          >
            Photo/video
          </Button>
        </Col>
        <Col xs={8} style={{ textAlign: "center" }}>
          <Button
            type="text"
            icon={<PlayCircleOutlined style={{ color: "purple" }} />}
            style={{ width: "100%" }}
            onClick={() =>
              message.info("Reels creation feature is coming soon!")
            }
          >
            Reel
          </Button>
        </Col>
      </Row>
    </Card>
  );
};

export default AddPostButton;
