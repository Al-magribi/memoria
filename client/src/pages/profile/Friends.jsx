import React from "react";
import { Card, Row, Col, Avatar, Typography, Flex, Button } from "antd";
// Sesuaikan path jika perlu

const { Title, Text } = Typography;

const Friends = ({ User }) => {
  return (
    <Card>
      <Title level={4}>Friends</Title>
      <Text type='secondary' style={{ display: "block", marginBottom: 16 }}>
        {User?.friendsCount} friends
      </Text>

      <Row gutter={[16, 16]}>
        {User?.friends.map((friend) => (
          // Dibuat lebih responsif untuk halaman penuh
          <Col xs={24} sm={8} md={6} key={friend.id}>
            <Card hoverable styles={{ body: { padding: 16 } }}>
              <Flex vertical align='center' gap={8}>
                <Avatar src={friend.avatar} size={80} />
                <Text ellipsis strong style={{ textAlign: "center" }}>
                  {friend.name}
                </Text>
                <Button block>View Profile</Button>
              </Flex>
            </Card>
          </Col>
        ))}
      </Row>
    </Card>
  );
};

export default Friends;
