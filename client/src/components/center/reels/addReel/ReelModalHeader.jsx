import { Avatar, Button, Flex, Space, Typography } from "antd";
import { GlobalOutlined, LockOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

const ReelModalHeader = ({ isPrivate, setIsPrivate }) => {
  const { user } = useSelector((state) => state.user);

  return (
    <Flex align='center' style={{ padding: "0 0 1rem 0" }}>
      <Avatar src={user?.avatar} size='large' />
      <Flex
        align='center'
        justify='space-between'
        style={{ marginLeft: "1rem", width: "100%" }}
      >
        <Typography.Text strong>{user?.username}</Typography.Text>
        <Button
          size='small'
          style={{ padding: "0 5px", height: "22px" }}
          icon={isPrivate ? <LockOutlined /> : <GlobalOutlined />}
          onClick={() => setIsPrivate(!isPrivate)}
        >
          {isPrivate ? "Private" : "Public"}
        </Button>
      </Flex>
    </Flex>
  );
};

export default ReelModalHeader;
