import { useState } from "react";
import {
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Flex,
  Input,
  Modal,
  Row,
  Typography,
  Upload,
  Popover,
  message,
  List,
  Spin,
  Empty,
  Tag,
  Space,
} from "antd";
import { User } from "../../../Dummies"; // Pastikan path ini benar
import {
  VideoCameraOutlined,
  FileImageOutlined,
  PlayCircleOutlined,
  UserOutlined,
  SmileOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  AimOutlined,
  CloseCircleFilled,
  LockOutlined,
} from "@ant-design/icons";
import EmojiPicker from "emoji-picker-react";

const { TextArea } = Input;
const { Text } = Typography;

// Komponen untuk menampilkan preview file yang akan diupload
const UploadPreview = ({ fileList, onRemove }) => {
  if (fileList.length === 0) return null;
  return (
    <div
      style={{
        marginTop: 16,
        border: "1px solid #d9d9d9",
        borderRadius: 8,
        padding: 8,
      }}
    >
      <Upload
        listType="picture-card"
        fileList={fileList}
        onRemove={onRemove}
        beforeUpload={() => false}
      />
    </div>
  );
};

const AddPost = () => {
  // Privasi
  const [isPrivate, setIsPrivate] = useState(false);

  // State untuk modal utama
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [fileList, setFileList] = useState([]);

  // State baru untuk fitur lokasi
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationSearch, setLocationSearch] = useState("");
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  // --- FUNGSI-FUNGSI UTAMA ---
  const showModal = () => setIsModalOpen(true);
  const handleCancel = () => {
    setPostText("");
    setFileList([]);
    setSelectedLocation(null); // Reset lokasi juga
    setIsModalOpen(false);
  };

  const handlePost = () => {
    console.log("Posting content:", {
      text: postText,
      files: fileList.map((f) => f.name),
      location: selectedLocation, // Kirim data lokasi
      isPrivate,
    });
    message.success("Your post has been published!");
    handleCancel();
  };

  const handleUploadChange = ({ fileList: newFileList }) =>
    setFileList(newFileList);
  const onEmojiClick = (emojiObject) =>
    setPostText((prevText) => prevText + emojiObject.emoji);
  const isPostDisabled = postText.trim() === "" && fileList.length === 0;

  // --- FUNGSI-FUNGSI LOKASI ---

  // Membuka modal lokasi
  const openLocationModal = () => setIsLocationModalOpen(true);

  // Menutup modal lokasi & mereset state-nya
  const closeLocationModal = () => {
    setIsLocationModalOpen(false);
    setLocationSuggestions([]);
    setLocationSearch("");
  };

  // Memilih lokasi dari daftar
  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
    closeLocationModal();
  };

  // Mengambil lokasi saat ini dari browser
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      message.error("Geolocation is not supported by your browser.");
      return;
    }

    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // Gunakan API Nominatim untuk Reverse Geocoding
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data && data.display_name) {
            const suggestions = [
              {
                place_id: data.place_id,
                display_name: data.display_name,
              },
            ];
            setLocationSuggestions(suggestions);
          } else {
            message.error("Could not find location name.");
          }
        } catch (error) {
          message.error("Failed to fetch location data.");
          console.error("Error fetching location:", error);
        } finally {
          setIsLoadingLocation(false);
        }
      },
      () => {
        setIsLoadingLocation(false);
        message.error(
          "Unable to retrieve your location. Please check your browser permissions."
        );
      }
    );
  };

  // Mencari lokasi berdasarkan input teks
  const handleSearchLocation = async (value) => {
    setLocationSearch(value);
    if (!value || value.trim().length < 3) {
      setLocationSuggestions([]);
      return;
    }

    setIsLoadingLocation(true);
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          value
        )}&limit=5`
      );
      const data = await response.json();
      setLocationSuggestions(data || []);
    } catch (error) {
      message.error("Failed to search for locations.");
      console.error("Error searching location:", error);
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <>
      {/* --- Tampilan Awal --- */}
      <Card style={{ marginBottom: "20px" }}>
        <Flex align="center" gap="middle">
          <Avatar icon={<UserOutlined />} src={User.avatar} size="large" />
          <Input
            placeholder={`What's on your mind, ${User.username}?`}
            onClick={showModal}
            readOnly
            style={{
              cursor: "pointer",
              backgroundColor: "#f0f2f5",
              borderRadius: "20px",
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

      {/* --- Modal Utama untuk Membuat Post --- */}
      <Modal
        title={
          <Text style={{ textAlign: "center", display: "block" }}>
            Create post
          </Text>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={
          <Button
            key="submit"
            type="primary"
            block
            onClick={handlePost}
            disabled={isPostDisabled}
          >
            Post
          </Button>
        }
      >
        <Divider style={{ marginTop: "12px" }} />
        <Flex align="center" gap="middle" justify="space-between">
          <Space>
            <Avatar src={User.avatar} size="large" />
            <Flex vertical>
              <Text strong>{User.username}</Text>

              {selectedLocation && (
                <Text strong style={{ fontSize: 10 }}>
                  {`at ${selectedLocation.display_name.split(",")[0]}`}
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

        <TextArea
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
          rows={5}
          placeholder={`What's on your mind, ${User.name}?`}
          variant="borderless"
          style={{
            fontSize: "1.2rem",
            padding: "10px 0",
            maxHeight: 200,
            overflowY: "auto",
          }}
        />
        <UploadPreview
          fileList={fileList}
          onRemove={(file) =>
            setFileList(fileList.filter((item) => item.uid !== file.uid))
          }
        />

        <Card style={{ marginTop: 16 }}>
          <Flex align="center" justify="space-between">
            <Text>Add to your post</Text>
            <Flex gap="small">
              <Upload
                accept="image/*,video/*"
                multiple
                showUploadList={false}
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={() => false}
              >
                <Button
                  type="text"
                  shape="circle"
                  icon={<FileImageOutlined style={{ color: "green" }} />}
                />
              </Upload>

              <Button
                type="text"
                shape="circle"
                icon={<UserOutlined style={{ color: "blue" }} />}
                onClick={() =>
                  message.info("Friend tagging UI would open here!")
                }
              />

              <Popover
                content={<EmojiPicker onEmojiClick={onEmojiClick} />}
                trigger="click"
                placement="topRight"
              >
                <Button
                  type="text"
                  shape="circle"
                  icon={<SmileOutlined style={{ color: "orange" }} />}
                />
              </Popover>
              {/* Tombol ini sekarang membuka modal lokasi */}
              <Button
                type="text"
                shape="circle"
                icon={<EnvironmentOutlined style={{ color: "red" }} />}
                onClick={openLocationModal}
              />
            </Flex>
          </Flex>
        </Card>
      </Modal>

      {/* --- Modal Baru Khusus untuk Tag Lokasi --- */}
      <Modal
        title="Tag location"
        open={isLocationModalOpen}
        onCancel={closeLocationModal}
        footer={null} // Tidak perlu footer
      >
        <Input.Search
          placeholder="Search for places"
          onSearch={handleSearchLocation}
          onChange={(e) => handleSearchLocation(e.target.value)} // Cari saat mengetik
          style={{ marginBottom: 16 }}
          enterButton
          loading={isLoadingLocation}
        />
        <Button
          icon={<AimOutlined />}
          onClick={handleGetCurrentLocation}
          style={{ marginBottom: 16 }}
          block
        >
          Use current location
        </Button>
        <Spin spinning={isLoadingLocation}>
          {locationSuggestions.length > 0 ? (
            <List
              bordered
              dataSource={locationSuggestions}
              renderItem={(item) => (
                <List.Item
                  onClick={() => handleSelectLocation(item)}
                  style={{ cursor: "pointer" }}
                >
                  <List.Item.Meta
                    avatar={<EnvironmentOutlined />}
                    title={item.display_name.split(",")[0]} // Ambil nama utamanya saja
                    description={item.display_name}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description="No location found. Try searching or using your current location." />
          )}
        </Spin>
        {selectedLocation && (
          <Tag
            closable
            onClose={() => setSelectedLocation(null)}
            style={{ marginTop: 16 }}
            icon={<EnvironmentOutlined />}
          >
            Selected: {selectedLocation.display_name.split(",")[0]}
          </Tag>
        )}
      </Modal>
    </>
  );
};

export default AddPost;
