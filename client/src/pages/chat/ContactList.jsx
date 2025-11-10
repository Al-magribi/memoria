import React from "react";
import { List, Avatar, Badge, Typography, Input, Flex } from "antd";

const { Text, Paragraph } = Typography;

const ContactList = ({
  contacts,
  selectedContactId,
  onSelectContact,
  onSearch,
}) => {
  return (
    <Flex vertical style={{ height: "100%" }}>
      <div style={{ padding: "16px", borderBottom: "1px solid #f0f0f0" }}>
        <Typography.Title level={4} style={{ margin: 0 }}>
          Chats
        </Typography.Title>
        <Input.Search
          placeholder="Search contacts"
          onChange={(e) => onSearch(e.target.value)}
          style={{ marginTop: "12px" }}
        />
      </div>
      <List
        itemLayout="horizontal"
        dataSource={contacts}
        style={{ overflowY: "auto", flex: 1, height: "100%" }}
        renderItem={(contact) => (
          <List.Item
            onClick={() => onSelectContact(contact.id)}
            style={{
              cursor: "pointer",
              padding: "12px 16px",
              background:
                selectedContactId === contact.id ? "#e6f7ff" : "transparent",
            }}
          >
            <List.Item.Meta
              avatar={
                <Badge
                  dot={contact.online}
                  color="green"
                  offset={[-5, 35]} // Posisi dot online
                >
                  <Avatar src={contact.avatar} size="large" />
                </Badge>
              }
              title={<Text strong>{contact.name}</Text>}
              description={
                <Paragraph type="secondary" ellipsis>
                  {/* Tampilkan cuplikan pesan terakhir */}
                  {contact.lastMessage?.content || "No messages yet"}
                </Paragraph>
              }
            />
          </List.Item>
        )}
      />
    </Flex>
  );
};

export default ContactList;