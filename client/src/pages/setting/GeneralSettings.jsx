import React from "react";
import { Form, Input, Button, Card, message, Typography } from "antd";
import { UserOutlined, MailOutlined } from "@ant-design/icons";
import { useUpdateGeneralMutation } from "../../service/user/ApiUser";
import { useEffect } from "react";

const { Title } = Typography;

// Komponen Form untuk Pengaturan Umum
const GeneralSettings = ({ User }) => {
  const [updateGeneral, { data, error, isLoading, isSuccess, reset }] =
    useUpdateGeneralMutation();
  const [form] = Form.useForm();

  // Handler saat form disubmit
  const onFinish = (values) => {
    updateGeneral(values);
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(data.message);
      reset();
    }

    if (error) {
      message.error(error.data.message);
      reset();
    }
  }, [data, error, isSuccess]);

  return (
    <Card title='General Account Settings'>
      <Form
        form={form}
        layout='vertical'
        onFinish={onFinish}
        // --- DIPERBARUI: initialValues disesuaikan dengan UserSchema ---
        initialValues={{
          firstName: User?.firstName, // Menggunakan firstName
          lastName: User?.lastName, // Menggunakan lastName
          username: User?.username,
          email: User?.email,
        }}
        // -----------------------------------------------------------
      >
        {/* --- DIPERBARUI: Form Items --- */}
        <Form.Item
          name='firstName'
          label='First Name'
          rules={[{ required: true, message: "Please enter your first name!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder='First Name' />
        </Form.Item>

        <Form.Item
          name='lastName'
          label='Last Name'
          rules={[{ required: true, message: "Please enter your last name!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder='Last Name' />
        </Form.Item>
        {/* ------------------------------- */}

        <Form.Item
          name='username'
          label='Username'
          rules={[{ required: true, message: "Please enter your username!" }]}
        >
          <Input prefix={<UserOutlined />} placeholder='Username' />
        </Form.Item>

        <Form.Item
          name='email'
          label='Email'
          rules={[
            { required: true, message: "Please enter your email!" },
            { type: "email", message: "The email is not valid!" },
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder='Email' />
        </Form.Item>

        <Form.Item>
          <Button type='primary' htmlType='submit' loading={isLoading}>
            Save Changes
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default GeneralSettings;
