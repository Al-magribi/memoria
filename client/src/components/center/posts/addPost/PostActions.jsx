import {
  Button,
  Card,
  Flex,
  Popover,
  Tooltip,
  Typography,
  Upload,
  message,
} from "antd";
import {
  FileImageOutlined,
  UserOutlined,
  SmileOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import EmojiPicker from "emoji-picker-react";

const { Text } = Typography;

const PostActions = ({
  fileList,
  handleUploadChange,
  onEmojiClick,
  openLocationModal,
}) => {
  return (
    <Card style={{ marginTop: 16 }}>
      <Flex align='center' justify='space-between'>
        <Text>Add to your post</Text>
        <Flex gap='small'>
          <Tooltip title='Photo / Video'>
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
          </Tooltip>

          <Tooltip title='Tag Friends'>
            <Button
              type='text'
              shape='circle'
              icon={<UserOutlined style={{ color: "blue" }} />}
              onClick={() => message.info("Friend tagging UI would open here!")}
            />
          </Tooltip>

          <Tooltip title='Emoji'>
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
          </Tooltip>

          <Tooltip title='Location'>
            <Button
              type='text'
              shape='circle'
              icon={<EnvironmentOutlined style={{ color: "red" }} />}
              onClick={openLocationModal}
              title='Location'
            />
          </Tooltip>
        </Flex>
      </Flex>
    </Card>
  );
};

export default PostActions;
