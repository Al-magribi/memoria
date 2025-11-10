import React from "react";
import { List, Avatar, Badge, Typography, Input, Flex, Tabs } from "antd"; // <-- 1. Impor Tabs

const { Text, Paragraph } = Typography;

const ContactList = ({
  contacts,
  selectedContactId,
  onSelectContact,
  onSearch,
  loading, // <-- 2. Tambahkan prop loading
  activeListTab, // <-- 3. Tambahkan prop tab
  onListTabChange, // <-- 4. Tambahkan prop handler tab
}) => {
  return (
    <Flex vertical style={{ height: "100%" }}>
      {/* --- PERUBAHAN 5: Header Baru dengan Tabs dan Search --- */}
      <div style={{ padding: "0 16px", borderBottom: "1px solid #f0f0f0" }}>
        {/* Title tidak lagi diperlukan, diganti Tabs */}
        <Tabs
          activeKey={activeListTab}
          onChange={onListTabChange}
          tabBarGutter={16}
        >
          <Tabs.TabPane tab='Chats' key='chats' />
          <Tabs.TabPane tab='Contact' key='contacts' />
        </Tabs>
        <Input.Search
          placeholder='Search...'
          onChange={(e) => onSearch(e.target.value)}
          style={{ marginTop: "4px", marginBottom: "12px" }}
          allowClear
        />
      </div>
      {/* --- AKHIR PERUBAHAN HEADER --- */}

      <List
        itemLayout='horizontal'
        dataSource={contacts}
        loading={loading} // <-- 6. Gunakan prop loading
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
                  dot={contact.isLogin} // <-- 7. Ganti 'online' menjadi 'isLogin'
                  color='green'
                  offset={[-5, 35]}
                >
                  <Avatar src={contact.avatar} size='large' />
                </Badge>
              }
              title={<Text strong>{contact.name}</Text>}
              description={
                <Flex align='center' justify='space-between'>
                  <Paragraph type='secondary' ellipsis>
                    {contact.lastMessage?.content}
                  </Paragraph>
                  {/* Hanya tampilkan waktu jika ada pesan terakhir */}
                  {contact.lastMessage?.createdAt && (
                    <Text type='secondary' style={{ fontSize: 12 }}>
                      {new Date(
                        contact.lastMessage.createdAt
                      ).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  )}
                </Flex>
              }
            />
          </List.Item>
        )}
      />
    </Flex>
  );
};

export default ContactList;
