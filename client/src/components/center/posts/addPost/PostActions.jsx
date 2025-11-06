import { Button, Card, Flex, Popover, Typography, Upload, message } from "antd";
import { FileImageOutlined, UserOutlined, SmileOutlined, EnvironmentOutlined } from "@ant-design/icons";
import EmojiPicker from "emoji-picker-react";

const { Text } = Typography;

const PostActions = ({ fileList, handleUploadChange, onEmojiClick, openLocationModal }) => {
    return (
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
                    <Button
                        type="text"
                        shape="circle"
                        icon={<EnvironmentOutlined style={{ color: "red" }} />}
                        onClick={openLocationModal}
                    />
                </Flex>
            </Flex>
        </Card>
    );
};

export default PostActions;
