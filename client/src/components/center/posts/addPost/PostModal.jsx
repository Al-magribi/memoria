import { Button, Divider, Modal, Typography } from "antd";
import PostModalHeader from "./PostModalHeader";
import PostTextArea from "./PostTextArea";
import UploadPreview from "./UploadPreview";
import PostActions from "./PostActions";

const { Text } = Typography;

const PostModal = ({
    isModalOpen,
    handleCancel,
    isEditMode,
    handlePost,
    isPostDisabled,
    isLoading,
    isPrivate,
    setIsPrivate,
    selectedLocation,
    postText,
    setPostText,
    fileList,
    setFileList,
    handleUploadChange,
    onEmojiClick,
    openLocationModal,
}) => {
    return (
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
                    key="submit"
                    type="primary"
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
            <PostModalHeader
                isPrivate={isPrivate}
                setIsPrivate={setIsPrivate}
                selectedLocation={selectedLocation}
            />
            <PostTextArea postText={postText} setPostText={setPostText} />
            <UploadPreview
                fileList={fileList}
                onRemove={(file) =>
                    setFileList(fileList.filter((item) => item.uid !== file.uid))
                }
            />
            <PostActions
                fileList={fileList}
                handleUploadChange={handleUploadChange}
                onEmojiClick={onEmojiClick}
                openLocationModal={openLocationModal}
            />
        </Modal>
    );
};

export default PostModal;
