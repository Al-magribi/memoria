import { Avatar, Card, Input, Tooltip, Typography } from "antd";
import {
  UserOutlined,
  PhoneOutlined,
  VideoCameraOutlined,
  MinusOutlined,
  CloseOutlined,
  SmileOutlined,
  GifOutlined,
  LikeOutlined,
  AudioOutlined,
  PaperClipOutlined,
} from "@ant-design/icons";
import "./Chat.css"; // Styling kustom
import { Conversations } from "../../Dummies";

const ChatWindow = ({ user, onClose }) => {
  const messages = Conversations[user.id] || [];

  // Header kustom untuk Card yang berisi nama, avatar, dan tombol aksi
  const ChatHeader = (
    <div className='chat-header'>
      <div className='chat-header-info'>
        <Avatar size='small' icon={<UserOutlined />} src={user.avatar} />
        <Typography.Text strong style={{ marginLeft: 8 }}>
          {user.name}
        </Typography.Text>
      </div>
      <div className='chat-header-actions'>
        <Tooltip title='Start a voice call'>
          <PhoneOutlined />
        </Tooltip>
        <Tooltip title='Start a video call'>
          <VideoCameraOutlined />
        </Tooltip>
        <Tooltip title='Minimize'>
          <MinusOutlined />
        </Tooltip>
        <Tooltip title='Close'>
          <CloseOutlined onClick={onClose} />
        </Tooltip>
      </div>
    </div>
  );

  return (
    <div className='chat-window-container'>
      <Card
        title={ChatHeader}
        style={{
          padding: 0,
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Bagian isi chat */}
        <div className='chat-body'>
          {/* Jika tidak ada pesan, tampilkan placeholder */}
          {messages.length === 0 ? (
            <div className='chat-body-placeholder'>
              <Avatar size={64} icon={<UserOutlined />} src={user.avatar} />
              <Typography.Title level={5}>{user.name}</Typography.Title>
              <Typography.Text type='secondary'>
                No messages yet. Start a conversation!
              </Typography.Text>
            </div>
          ) : (
            // Jika ada pesan, render pesan-pesan tersebut
            <div className='message-list'>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`message-item ${
                    msg.senderId === "me" ? "my-message" : "their-message"
                  }`}
                >
                  <div className='message-bubble'>{msg.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bagian input pesan */}
        <div className='chat-footer'>
          <Input
            placeholder='Aa'
            style={{ width: "100%" }}
            suffix={<SmileOutlined />}
          />

          <div className='chat-footer-icons'>
            <Tooltip title='More actions'>
              <AudioOutlined />
            </Tooltip>
            <Tooltip title='Attach a file'>
              <PaperClipOutlined />
            </Tooltip>
            <Tooltip title='Choose a GIF'>
              <GifOutlined />
            </Tooltip>

            <Tooltip title='Send a Like'>
              <LikeOutlined />
            </Tooltip>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ChatWindow;
