import { Avatar, Button, Flex, Space, Typography } from "antd";
import { UserOutlined, GlobalOutlined, LockOutlined } from "@ant-design/icons";
import { useSelector } from "react-redux";

const { Text } = Typography;

const PostModalHeader = ({ isPrivate, setIsPrivate, selectedLocation }) => {
    const { user } = useSelector((state) => state.user);

    return (
        <Flex align="center" gap="middle" justify="space-between">
            <Space>
                <Avatar
                    icon={<UserOutlined />}
                    src={user?.avatar}
                    size="large"
                    shape="circle"
                />
                <Flex vertical>
                    <Text strong>{user?.username}</Text>
                    {selectedLocation && (
                        <Text strong style={{ fontSize: 10 }}>
                            {`at ${selectedLocation.display_name?.split(",")[0]}`}
                        </Text>
                    )}
                </Flex>
            </Space>
            <Button
                size="small"
                icon={!isPrivate ? <GlobalOutlined /> : <LockOutlined />}
                onClick={() => setIsPrivate(!isPrivate)}
            >
                {!isPrivate ? "Public" : "Private"}
            </Button>
        </Flex>
    );
};

export default PostModalHeader;
