
import { Upload, Button, message } from "antd";
import { VideoCameraAddOutlined } from "@ant-design/icons";

const UploadReel = ({ video, setVideo }) => {
  const beforeUpload = (file) => {
    const isMp4 = file.type === "video/mp4";
    if (!isMp4) {
      message.error("You can only upload MP4 file!");
    }
    const isLt2M = file.size / 1024 / 1024 < 100; // Max 100MB
    if (!isLt2M) {
      message.error("Video must be smaller than 100MB!");
    }
    if (isMp4 && isLt2M) {
      setVideo(file);
    }
    return false; // Prevent default upload behavior
  };

  return (
    <div>
      <Upload
        beforeUpload={beforeUpload}
        showUploadList={false}
        accept="video/mp4"
      >
        <Button icon={<VideoCameraAddOutlined />}>Upload Video</Button>
      </Upload>
      {video && (
        <div style={{ marginTop: "1rem" }}>
          <video
            src={URL.createObjectURL(video)}
            controls
            style={{ width: "100%" }}
          />
        </div>
      )}
    </div>
  );
};

export default UploadReel;
