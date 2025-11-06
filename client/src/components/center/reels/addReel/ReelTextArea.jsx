import { Input } from "antd";
import UploadReel from "./UploadReel";

const ReelTextArea = ({ caption, setCaption, video, setVideo }) => {
  return (
    <div style={{ maxHeight: "50vh", overflowY: "auto" }}>
      <Input.TextArea
        placeholder="What's on your mind?"
        variant='borderless'
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        autoSize={{ minRows: 3, maxRows: 5 }}
        style={{ fontSize: "1.2rem", marginBottom: "16px" }}
      />
      <UploadReel video={video} setVideo={setVideo} />
    </div>
  );
};

export default ReelTextArea;
