import React from "react";
import { Form, Input, Button, Card, message, Typography } from "antd";
import { UserOutlined, MailOutlined } from "@ant-design/icons";
import { User } from "../../Dummies"; // Sesuaikan path jika perlu

const { Title } = Typography;

// Komponen Form untuk Pengaturan Umum
const GeneralSettings = () => {
  const [form] = Form.useForm();

  // Handler saat form disubmit
  const onFinish = (values) => {
    // Kita tetap log data dummy, sesuai permintaan
    console.log("Updated General Settings (Dummy):", values);
    message.success("General settings updated successfully! (Dummy)");
  };

  return (
    <Card title="General Account Settings">
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        // --- DIPERBARUI: initialValues disesuaikan dengan UserSchema ---
        initialValues={{
          firstName: User.firstName, // Menggunakan firstName
          lastName: User.lastName, // Menggunakan lastName
          username: User.username,
          email: User.email,
        }}
        // -----------------------------------------------------------
      >
        {/* --- DIPERBARUI: Form Items --- */}
        <Form.Item
          name="firstName"
          label="First Name"
          rules={[{ required: true, message: "Please enter your first name!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="First Name" />
        </Form.Item>

        <Form.Item
          name="lastName"
          label="Last Name"
          rules={[{ required: true, message: "Please enter your last name!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Last Name" />
        </Form.Item>
        {/* ------------------------------- */}

        <Form.Item
          name="username"
          label="Username"
          rules={[{ required: true, message: "Please enter your username!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder="Username" />
        </Form.Item>

        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: "Please enter your email!" },
            { type: "email", message: "The email is not valid!" },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Email" />
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

export default GeneralSettings;
