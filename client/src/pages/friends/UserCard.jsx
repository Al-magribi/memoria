import React from "react";
import { Card, Avatar, Button, Flex, Typography } from "antd";
import {
  UserAddOutlined,
  CheckOutlined,
  CloseOutlined,
  UserDeleteOutlined,
  UserOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const UserCard = ({
  user,
  status,
  onAdd,
  onAccept,
  onReject,
  onCancel,
  onRemove,
}) => {
  const renderButtons = () => {
    switch (status) {
      case "add":
        return (
          <Button
            type='primary'
            icon={<UserAddOutlined />}
            onClick={onAdd}
            block
          >
            Add Friend
          </Button>
        );
      case "sent":
        return (
          <Button onClick={onCancel} block>
            Cancel Request
          </Button>
        );
      case "received":
        return (
          <Flex wrap='wrap' justify='center' align='center' gap='small'>
            <Button type='primary' icon={<CheckOutlined />} onClick={onAccept}>
              Accept
            </Button>
            <Button danger icon={<CloseOutlined />} onClick={onReject}>
              Decline
            </Button>
          </Flex>
        );
      case "friend":
        return (
          <Button danger icon={<UserDeleteOutlined />} onClick={onRemove} block>
            Remove Friend
          </Button>
        );
      default:
        return null;
    }
  };

  return (
    <Card hoverable>
      <Flex vertical align='center' gap='small'>
        <Avatar src={user.avatar} size={80} icon={<UserOutlined />} />
        <Title ellipsis level={5} style={{ margin: 0, textAlign: "center" }}>
          {`${user.firstName} ${user.lastName}`}
        </Title>

        <div style={{ marginTop: 8 }}>{renderButtons()}</div>
      </Flex>
    </Card>
  );
};

export default UserCard;
