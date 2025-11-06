import { Upload } from "antd";

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

export default UploadPreview;
