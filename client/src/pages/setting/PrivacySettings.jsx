import React from "react";
import { Form, Select, Switch, Button, Card, message, Typography } from "antd";
import { User } from "../../Dummies"; // Sesuaikan path jika perlu

const { Option } = Select;
const { Title, Text } = Typography;

const PrivacySettings = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    // Kita tetap log data dummy, sesuai permintaan
    console.log("Updated Privacy Settings (Dummy):", values);
    message.success("Privacy settings updated successfully! (Dummy)");
  };

  return (
    <Card title="Privacy Settings">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        // Ambil data awal dari dummy User.privacy
        initialValues={User.privacy}
      >
        <Title level={5}>Profile Privacy Controls</Title>

        <Form.Item name="showProfile" label="Who can see your profile?">
          <Select>
            <Option value="public">Public</Option>
            <Option value="friends">Friends</Option>
            <Option value="private">Only Me</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="whoCanSeeFriendsList"
          label="Who can see your friends list?"
        >
          <Select>
            <Option value="public">Public</Option>
            <Option value="friends">Friends</Option>
            <Option value="private">Only Me</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="whoCanSendFriendRequest"
          label="Who can send you friend requests?"
        >
          <Select>
            <Option value="everyone">Everyone</Option>
            <Option value="friends_of_friends">Friends of Friends</Option>
          </Select>
        </Form.Item>

        <Title level={5} style={{ marginTop: "24px" }}>
          Contact Info Controls
        </Title>

        <Form.Item name="whoCanSeePhone" label="Who can see your phone number?">
          <Select>
            <Option value="public">Public</Option>
            <Option value="friends">Friends</Option>
            <Option value="private">Only Me</Option>
          </Select>
        </Form.Item>

        <Form.Item name="whoCanSeeDOB" label="Who can see your date of birth?">
          <Select>
            <Option value="public">Public (Day, Month, Year)</Option>
            <Option value="friends">Friends (Day, Month, Year)</Option>
            <Option value="only_month_day">Friends (Only Day & Month)</Option>
            <Option value="private">Only Me</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="showEmail"
          label="Show your email on your public profile?"
          // valuePropName="checked" penting untuk Switch di antd Form
          valuePropName="checked"
        >
          <Switch checkedChildren="Yes" unCheckedChildren="No" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default PrivacySettings;
