
import { Button, Divider, Modal, Typography } from "antd";
import ReelModalHeader from "./ReelModalHeader";
import ReelTextArea from "./ReelTextArea";
import { useState } from "react";

const ReelModal = ({
  isModalOpen,
  handleCancel,
  handleOk,
  isSubmitting,
  video,
  setVideo,
  caption,
  setCaption,
}) => {
  const [isPrivate, setIsPrivate] = useState(false);

  return (
    <Modal
      title={<Typography.Title level={4}>Create Reel</Typography.Title>}
      centered
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={[
        <Button
          key="submit"
          type="primary"
          onClick={handleOk}
          block
          loading={isSubmitting}
          disabled={!video}
        >
          Post
        </Button>,
      ]}
    >
      <Divider />
      <ReelModalHeader isPrivate={isPrivate} setIsPrivate={setIsPrivate} />
      <ReelTextArea
        caption={caption}
        setCaption={setCaption}
        video={video}
        setVideo={setVideo}
      />
      <Divider />
    </Modal>
  );
};

export default ReelModal;
