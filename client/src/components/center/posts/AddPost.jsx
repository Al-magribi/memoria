import { useState, useEffect } from "react";
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
import {
  VideoCameraOutlined,
  FileImageOutlined,
  PlayCircleOutlined,
  UserOutlined,
  SmileOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  AimOutlined,
  LockOutlined,
} from "@ant-design/icons";
import EmojiPicker from "emoji-picker-react";
import { useSelector } from "react-redux";
import {
  useCreatePostMutation,
  useUpdatePostMutation,
} from "../../../service/post/ApiPost";

const { TextArea } = Input;
const { Text } = Typography;

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
        listType='picture-card'
        fileList={fileList}
        onRemove={onRemove}
        beforeUpload={() => false}
      />
    </div>
  );
};

const AddPost = ({
  postToEdit,
  isModalOpen: propIsModalOpen,
  handleCancel: propHandleCancel,
}) => {
  const { user } = useSelector((state) => state.user);

  const [
    createPost,
    {
      isLoading: isCreating,
      isSuccess: isCreateSuccess,
      error: createError,
      reset: resetCreate,
    },
  ] = useCreatePostMutation();
  const [
    updatePost,
    {
      isLoading: isUpdating,
      isSuccess: isUpdateSuccess,
      error: updateError,
      reset: resetUpdate,
    },
  ] = useUpdatePostMutation();

  const [isPrivate, setIsPrivate] = useState(false);
  const [isInternalModalOpen, setIsInternalModalOpen] = useState(false);
  const [postText, setPostText] = useState("");
  const [fileList, setFileList] = useState([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);

  const isEditMode = !!postToEdit;
  const isModalOpen = isEditMode ? propIsModalOpen : isInternalModalOpen;
  const isLoading = isCreating || isUpdating;

  useEffect(() => {
    if (isEditMode) {
      setPostText(postToEdit.content);
      setIsPrivate(postToEdit.privacy === "private");
      setSelectedLocation(postToEdit.location);
      const existingFiles = [
        ...(postToEdit.images || []).map((image, index) => ({
          // <-- Ganti 'url' menjadi 'image'
          uid: `image-${index}`,
          name: `image-${index}.png`,
          status: "done",
          url: image.url, // <-- Akses properti .url
        })),
        ...(postToEdit.videos || []).map((video, index) => ({
          // <-- Ganti 'url' menjadi 'video'
          uid: `video-${index}`,
          name: `video-${index}.mp4`,
          status: "done",
          url: video.url, // <-- Akses properti .url
        })),
      ];
      setFileList(existingFiles);
    } else {
      setPostText("");
      setFileList([]);
      setSelectedLocation(null);
      setIsPrivate(false);
    }
  }, [postToEdit, isEditMode]);

  const showModal = () => setIsInternalModalOpen(true);

  const handleCancel = () => {
    if (isEditMode) {
      propHandleCancel();
    } else {
      setIsInternalModalOpen(false);
    }
    // Reset state after modal closes
    setTimeout(() => {
      if (!isEditMode) {
        setPostText("");
        setFileList([]);
        setSelectedLocation(null);
      }
    }, 300); // Delay to allow modal to close gracefully
  };

  const handleUploadChange = ({ fileList: newFileList }) =>
    setFileList(newFileList);
  const onEmojiClick = (emojiObject) =>
    setPostText((prevText) => prevText + emojiObject.emoji);
  const isPostDisabled = postText.trim() === "" && fileList.length === 0;

  const handlePost = () => {
    const formData = new FormData();
    formData.append("content", postText);
    formData.append("isPrivate", isPrivate);
    if (selectedLocation) {
      formData.append("location", JSON.stringify(selectedLocation));
    }

    const existingMedia = fileList.filter((f) => f.url).map((f) => f.url);
    formData.append("existingMedia", JSON.stringify(existingMedia));

    const newFiles = fileList.filter((f) => f.originFileObj);
    newFiles.forEach((file) => {
      formData.append("files", file.originFileObj);
    });

    if (isEditMode) {
      updatePost({ id: postToEdit.id, formData });
    } else {
      createPost(formData);
    }
  };

  useEffect(() => {
    if (isCreateSuccess) {
      message.success("Post created successfully");
      handleCancel();
      resetCreate();
    }
    if (createError) {
      message.error(createError.data.message);
      resetCreate();
    }
  }, [isCreateSuccess, createError]);

  useEffect(() => {
    if (isUpdateSuccess) {
      message.success("Post updated successfully");
      handleCancel();
      resetUpdate();
    }
    if (updateError) {
      message.error(updateError.data.message);
      resetUpdate();
    }
  }, [isUpdateSuccess, updateError]);

  const openLocationModal = () => setIsLocationModalOpen(true);
  const closeLocationModal = () => {
    setIsLocationModalOpen(false);
    setLocationSuggestions([]);
  };

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
    closeLocationModal();
  };

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      message.error("Geolocation is not supported by your browser.");
      return;
    }
    setIsLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await response.json();
          if (data && data.display_name) {
            setLocationSuggestions([
              { place_id: data.place_id, display_name: data.display_name },
            ]);
          } else {
            message.error("Could not find location name.");
          }
        } catch (error) {
          message.error("Failed to fetch location data.");
        } finally {
          setIsLoadingLocation(false);
        }
      },
      () => {
        setIsLoadingLocation(false);
        message.error("Unable to retrieve your location.");
      }
    );
  };

  const handleSearchLocation = async (value) => {
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
    } finally {
      setIsLoadingLocation(false);
    }
  };

  return (
    <>
      {!isEditMode && (
        <Card style={{ marginBottom: "20px" }}>
          <Flex align='center' gap='middle'>
            <Avatar icon={<UserOutlined />} src={user?.avatar} size='large' />
            <Input
              placeholder={`What's on your mind, ${user?.username}?`}
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
                type='text'
                icon={<VideoCameraOutlined style={{ color: "red" }} />}
                style={{ width: "100%" }}
                onClick={() =>
                  message.info("Live video feature is coming soon!")
                }
              >
                Live
              </Button>
            </Col>
            <Col xs={8} style={{ textAlign: "center" }}>
              <Button
                type='text'
                icon={<FileImageOutlined style={{ color: "green" }} />}
                style={{ width: "100%" }}
                onClick={showModal}
              >
                Photo/video
              </Button>
            </Col>
            <Col xs={8} style={{ textAlign: "center" }}>
              <Button
                type='text'
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
      )}

      <Modal
        title={
          <Text style={{ textAlign: "center", display: "block" }}>
            {isEditMode ? "Edit post" : "Create post"}
          </Text>
        }
        open={isModalOpen}
        onCancel={handleCancel}
        footer={[
          <Button
            key='submit'
            type='primary'
            block
            onClick={handlePost}
            disabled={isPostDisabled}
            loading={isLoading}
          >
            {isEditMode ? "Save" : "Post"}
          </Button>,
        ]}
      >
        <Divider style={{ marginTop: "12px" }} />
        <Flex align='center' gap='middle' justify='space-between'>
          <Space>
            <Avatar icon={<UserOutlined />} src={user?.avatar} size='large' />
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
            size='small'
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
          placeholder={`What's on your mind, ${user?.name}?`}
          variant='borderless'
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
          <Flex align='center' justify='space-between'>
            <Text>Add to your post</Text>
            <Flex gap='small'>
              <Upload
                accept='image/*,video/*'
                multiple
                showUploadList={false}
                fileList={fileList}
                onChange={handleUploadChange}
                beforeUpload={() => false}
              >
                <Button
                  type='text'
                  shape='circle'
                  icon={<FileImageOutlined style={{ color: "green" }} />}
                />
              </Upload>
              <Button
                type='text'
                shape='circle'
                icon={<UserOutlined style={{ color: "blue" }} />}
                onClick={() =>
                  message.info("Friend tagging UI would open here!")
                }
              />
              <Popover
                content={<EmojiPicker onEmojiClick={onEmojiClick} />}
                trigger='click'
                placement='topRight'
              >
                <Button
                  type='text'
                  shape='circle'
                  icon={<SmileOutlined style={{ color: "orange" }} />}
                />
              </Popover>
              <Button
                type='text'
                shape='circle'
                icon={<EnvironmentOutlined style={{ color: "red" }} />}
                onClick={openLocationModal}
              />
            </Flex>
          </Flex>
        </Card>
      </Modal>

      <Modal
        title='Tag location'
        open={isLocationModalOpen}
        onCancel={closeLocationModal}
        footer={null}
      >
        <Input.Search
          placeholder='Search for places'
          onSearch={handleSearchLocation}
          onChange={(e) => handleSearchLocation(e.target.value)}
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
                    title={item.display_name?.split(",")[0]}
                    description={item.display_name}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Empty description='No location found.' />
          )}
        </Spin>
        {selectedLocation && (
          <Tag
            closable
            onClose={() => setSelectedLocation(null)}
            style={{ marginTop: 16 }}
            icon={<EnvironmentOutlined />}
          >
            Selected: {selectedLocation.display_name?.split(",")[0]}
          </Tag>
        )}
      </Modal>
    </>
  );
};

export default AddPost;
