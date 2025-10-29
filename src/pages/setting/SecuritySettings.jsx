import React from "react";
import { Form, Input, Button, Card, message, Typography } from "antd";
import { LockOutlined } from "@ant-design/icons";

const { Title } = Typography;

// Komponen Form untuk Pengaturan Keamanan (Ganti Password)
const SecuritySettings = () => {
  const [form] = Form.useForm();

  const onFinish = (values) => {
    console.log("Updated Password (Dummy):", values);
    // Di aplikasi nyata, Anda akan memanggil API di sini
    message.success("Password updated successfully! (Dummy)");
    form.resetFields(); // Kosongkan form setelah berhasil
  };

  return (
    <Card title="Security and Login">
      <Title level={5}>Change Password</Title>
      <Form form={form} layout="vertical" onFinish={onFinish}>
        <Form.Item
          name="currentPassword"
          label="Current Password"
          rules={[
            { required: true, message: "Please enter your current password!" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Current Password"
          />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="New Password"
          rules={[
            { required: true, message: "Please enter your new password!" },
            { min: 6, message: "Password must be at least 6 characters!" },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="New Password"
          />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="Confirm New Password"
          dependencies={["newPassword"]} // Bergantung pada field 'newPassword'
          rules={[
            { required: true, message: "Please confirm your new password!" },
            // Validasi kustom untuk mencocokkan password
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue("newPassword") === value) {
                  return Promise.resolve();
                }
                return Promise.reject(
                  new Error("The new passwords that you entered do not match!")
                );
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined />}
            placeholder="Confirm New Password"
          />
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

export default SecuritySettings;
