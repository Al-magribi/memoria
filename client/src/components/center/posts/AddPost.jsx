import { useState, useEffect } from "react";
import { message } from "antd";
import { useSelector } from "react-redux";
import {
  useCreatePostMutation,
  useUpdatePostMutation,
} from "../../../service/post/ApiPost";
import AddPostButton from "./addPost/AddPostButton";
import PostModal from "./addPost/PostModal";
import LocationModal from "./addPost/LocationModal";

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
  const [selectedLocation, setSelectedLocation] = useState(null);

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
          uid: `image-${index}`,
          name: `image-${index}.png`,
          status: "done",
          url: image.url,
        })),
        ...(postToEdit.videos || []).map((video, index) => ({
          uid: `video-${index}`,
          name: `video-${index}.mp4`,
          status: "done",
          url: video.url,
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
    setTimeout(() => {
      if (!isEditMode) {
        setPostText("");
        setFileList([]);
        setSelectedLocation(null);
      }
    }, 300);
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
  }, [isCreateSuccess, createError, handleCancel, resetCreate]);

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
  }, [isUpdateSuccess, updateError, handleCancel, resetUpdate]);

  const openLocationModal = () => setIsLocationModalOpen(true);
  const closeLocationModal = () => {
    setIsLocationModalOpen(false);
  };

  const handleSelectLocation = (location) => {
    setSelectedLocation(location);
    closeLocationModal();
  };

  return (
    <>
      {!isEditMode && <AddPostButton showModal={showModal} />}

      <PostModal
        isModalOpen={isModalOpen}
        handleCancel={handleCancel}
        isEditMode={isEditMode}
        handlePost={handlePost}
        isPostDisabled={isPostDisabled}
        isLoading={isLoading}
        isPrivate={isPrivate}
        setIsPrivate={setIsPrivate}
        selectedLocation={selectedLocation}
        postText={postText}
        setPostText={setPostText}
        fileList={fileList}
        setFileList={setFileList}
        handleUploadChange={handleUploadChange}
        onEmojiClick={onEmojiClick}
        openLocationModal={openLocationModal}
      />

      <LocationModal
        isLocationModalOpen={isLocationModalOpen}
        closeLocationModal={closeLocationModal}
        handleSelectLocation={handleSelectLocation}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      />
    </>
  );
};

export default AddPost;
