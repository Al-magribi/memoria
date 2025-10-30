import { Modal } from "antd";
import React from "react";

const Comment = ({ comments, open, onClose }) => {
  return (
    <Modal
      title={`${comments?.length} Comments`}
      open={open}
      onCancel={onClose}
      footer={null}
    >
      Comment
    </Modal>
  );
};

export default Comment;
