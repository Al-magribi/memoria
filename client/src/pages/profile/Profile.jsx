import React, { useEffect, useState, useRef } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Row,
  Typography,
  Flex,
  Tabs,
  Grid,
  Image,
  Space,
  List,
  message,
} from "antd";
import { EditOutlined, MessageOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import AddPost from "../../components/center/posts/AddPost";
import PostCard from "../../components/center/posts/PostCard";
import About from "./About";
import Friends from "./Friends";
import Photos from "./Photos";
import {
  useGetProfileQuery,
  useLoadUserQuery,
  useUploadProfileImagesMutation,
} from "../../service/user/ApiUser";
import { useGetPostsByUserIdQuery } from "../../service/post/ApiPost";

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

// --- Komponen-komponen Kecil untuk Kerapian ---

// Kiri: Komponen Preview Foto
const ProfilePhotos = ({ User }) => (
  <Card style={{ marginTop: 16 }}>
    <Title level={5}>Photos</Title>
    <Image.PreviewGroup>
      <Row gutter={[8, 8]}>
        {User?.photos?.slice(0, 6).map((photo, index) => (
          // PERBAIKAN: Dibuat responsif, 2 kolom di xs, 3 di sm+
          <Col xs={12} sm={8} key={index}>
            <Image
              src={photo.url}
              style={{
                aspectRatio: "1/1",
                objectFit: "cover",
                borderRadius: 8,
              }}
            />
          </Col>
        ))}
      </Row>
    </Image.PreviewGroup>
  </Card>
);

// Kiri: Komponen Preview Teman
const ProfileFriends = ({ User }) => (
  <Card style={{ marginTop: 16 }}>
    <Title level={5}>Friends</Title>
    <Text type='secondary' style={{ display: "block", marginBottom: 16 }}>
      {User?.friendsCount} friends
    </Text>
    <Row gutter={[8, 8]}>
      {User?.friends?.slice(0, 6).map((friend) => (
        // PERBAIKAN: Dibuat responsif, 2 kolom di xs, 3 di sm+
        <Col xs={12} sm={8} key={friend.id}>
          <Flex vertical align='center' gap={4}>
            <Avatar src={friend.avatar} size={64} style={{ borderRadius: 8 }} />
            <Text ellipsis style={{ fontSize: 12, textAlign: "center" }} strong>
              {friend.name}
            </Text>
          </Flex>
        </Col>
      ))}
    </Row>
  </Card>
);

// --- Komponen Utama Profil ---

const Profile = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const { fullName } = useParams();

  const { data: User } = useGetProfileQuery(fullName, { skip: !fullName });
  const [
    uploadProfileImages,
    { isLoading: isUploading, isSuccess, data, error },
  ] = useUploadProfileImagesMutation();
  const { refetch } = useLoadUserQuery();

  const [currentAvatar, setCurrentAvatar] = useState(null);
  const [currentCover, setCurrentCover] = useState(null);
  const [filesToUpload, setFilesToUpload] = useState({
    avatar: null,
    cover: null,
  });
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    if (User) {
      setCurrentAvatar(User.avatar);
      setCurrentCover(User.coverPhoto);
    }
  }, [User]);

  const handleFileChange = (event, type) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "avatar") {
          setCurrentAvatar(reader.result);
        } else {
          setCurrentCover(reader.result);
        }
      };
      reader.readAsDataURL(file);
      setFilesToUpload((prev) => ({ ...prev, [type]: file }));
      event.target.value = null;
    }
  };

  const handleAvatarClick = () => {
    avatarInputRef.current.click();
  };

  const handleCoverClick = () => {
    coverInputRef.current.click();
  };

  const handleSave = async () => {
    uploadProfileImages(filesToUpload);
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(data.message);

      refetch();
      setFilesToUpload({ avatar: null, cover: null });
    }

    if (error) {
      message.error(error.data.message);
    }
  }, [data, error, isSuccess, refetch]);

  const { data: posts } = useGetPostsByUserIdQuery(User?._id, {
    skip: !User,
  });

  const handleLayoutTabChange = (key) => {
    localStorage.setItem("activeTab", key);
    navigate("/");
  };

  const items = [
    {
      key: "1",
      label: "Posts",
      children: (
        <Row gutter={[16, 16]}>
          {/* Kolom Kiri: Intro, Photos, Friends */}
          <Col xs={24} md={10}>
            <Flex vertical>
              {/* Komponen ProfilePhotos dan ProfileFriends (di atas)
                  sudah diperbaiki secara internal */}
              <ProfilePhotos User={User} />
              <ProfileFriends User={User} />
            </Flex>
          </Col>

          {/* Kolom Kanan: Add Post & Feed */}
          <Col xs={24} md={14}>
            <Flex vertical gap='small'>
              <AddPost />
              {posts?.map((post, index) => (
                <PostCard key={index} post={post} />
              ))}
            </Flex>
          </Col>
        </Row>
      ),
    },
    { key: "2", label: "About", children: <About /> },
    { key: "3", label: "Friends", children: <Friends /> },
    { key: "4", label: "Photos", children: <Photos /> },
  ];

  return (
    <MainLayout activeTab='profile' onTabChange={handleLayoutTabChange}>
      <input
        type='file'
        ref={avatarInputRef}
        style={{ display: "none" }}
        accept='image/*'
        onChange={(e) => handleFileChange(e, "avatar")}
      />
      <input
        type='file'
        ref={coverInputRef}
        style={{ display: "none" }}
        accept='image/*'
        onChange={(e) => handleFileChange(e, "cover")}
      />

      <Card
        style={{
          width: "100%",
          maxWidth: 1100,
        }}
        styles={{ body: { padding: 0 } }}
      >
        {/* Cover Photo */}
        <div style={{ position: "relative" }}>
          <img
            src={currentCover || "/cover.jpeg"}
            alt='Cover'
            onClick={handleCoverClick}
            style={{
              width: "100%",
              height: screens.md ? 400 : 200,
              objectFit: "cover",
              borderTopLeftRadius: 8,
              borderTopRightRadius: 8,
              display: "block",
              cursor: "pointer",
            }}
            loading='lazy'
          />
          {/* Profile Picture */}
          <Avatar
            src={currentAvatar}
            icon={<UserOutlined style={{ fontSize: 60 }} />}
            onClick={handleAvatarClick}
            // PERBAIKAN: Ukuran avatar dan posisinya dibuat responsif
            style={{
              width: screens.md ? 168 : 100,
              height: screens.md ? 168 : 100,
              border: "4px solid #fff",
              position: "absolute",
              bottom: screens.md ? -32 : -24,
              left: screens.md ? 32 : 16,
              zIndex: 2,
              cursor: "pointer",
            }}
          />
        </div>

        {/* Info Nama & Tombol Aksi */}
        <Flex
          // PERBAIKAN: Padding kiri disesuaikan untuk avatar yang lebih kecil
          style={{
            padding: screens.md ? "16px 32px 0 220px" : "16px 16px 0 136px", // 100px avatar + 16px kiri + 20px spasi
            minHeight: 116,
            borderBottom: "1px solid #f0f0f0",
          }}
          align='center'
          justify='space-between'
          wrap='wrap'
        >
          <Flex vertical style={{ marginBottom: 16 }}>
            <Title level={screens.lg ? 2 : 5} style={{ margin: 0 }}>
              {User?.fullName}
            </Title>
            <Text type='secondary' strong>
              {User?.friendsCount} friends
            </Text>
          </Flex>
          <Space style={{ marginBottom: 16 }}>
            {(filesToUpload.avatar || filesToUpload.cover) && (
              <Button type='primary' onClick={handleSave} loading={isUploading}>
                Save Changes
              </Button>
            )}
            <Button
              type='primary'
              icon={<EditOutlined />}
              onClick={() => navigate("/settings")}
            >
              Settings
            </Button>
            <Button icon={<MessageOutlined />} />
          </Space>
        </Flex>

        {/* Navigasi Tabs (Posts, About, Friends) */}
        <Tabs
          defaultActiveKey='1'
          items={items}
          // PERBAIKAN: Padding tabs dikurangi di mobile
          style={{ padding: screens.md ? "0 32px" : "0 16px" }}
        />
      </Card>
    </MainLayout>
  );
};

export default Profile;
