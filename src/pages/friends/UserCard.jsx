import React, { useState } from "react";
import { Card, Avatar, Button, Flex, Typography } from "antd";
import { UserAddOutlined, CheckOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const UserCard = ({ user }) => {
  // State lokal untuk simulasi tambah/hapus teman
  const [isFriend, setIsFriend] = useState(user.isFriend);
  const [loading, setLoading] = useState(false);

  const handleAdd = () => {
    setLoading(true);
    // Simulasi API call
    setTimeout(() => {
      setIsFriend(!isFriend);
      setLoading(false);
    }, 500);
  };

  return (
    <Card hoverable>
      <Flex vertical align="center" gap="small">
        <Avatar src={user.avatar} size={80} />
        <Title level={5} style={{ margin: 0, textAlign: "center" }}>
          {user.name}
        </Title>
        <Text type="secondary" style={{ textAlign: "center" }}>
          @{user.username}
        </Text>
        <Button
          type={isFriend ? "default" : "primary"}
          icon={isFriend ? <CheckOutlined /> : <UserAddOutlined />}
          onClick={handleAdd}
          loading={loading}
          block
          style={{ marginTop: 8 }}
        >
          {isFriend ? "Friend" : "Add Friend"}
        </Button>
      </Flex>
    </Card>
  );
};

export default UserCard;
