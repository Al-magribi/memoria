import React, { useEffect } from "react"; // <-- 1. Import useEffect
import { Form, Input, Button, Card, message, Typography } from "antd";
import { UserOutlined, MailOutlined } from "@ant-design/icons";
import { useUpdateGeneralMutation } from "../../service/user/ApiUser";
// (useEffect sudah diimpor untuk menangani message, kita gunakan lagi)

const { Title } = Typography;

// Komponen Form untuk Pengaturan Umum
const GeneralSettings = ({ User }) => {
  const [updateGeneral, { data, error, isLoading, isSuccess, reset }] =
    useUpdateGeneralMutation();
  const [form] = Form.useForm(); // <-- 2. Instance form sudah ada

  // Handler saat form disubmit
  const onFinish = (values) => {
    updateGeneral(values);
  };

  // --- INI PERBAIKANNYA ---
  // 3. Tambahkan hook useEffect untuk mengisi form
  // Ini akan berjalan setiap kali prop 'User' berubah
  useEffect(() => {
    // Cek jika data User sudah ada
    if (User) {
      // 4. PAKSA form untuk diisi dengan data yang baru datang
      form.setFieldsValue({
        firstName: User.firstName,
        lastName: User.lastName,
        email: User.email,
        // (Anda punya 'username' di initialValues lama,
        // tapi tidak ada field form-nya, jadi saya hilangkan)
      });
    }
  }, [User, form]); // <-- Dependencies: jalankan saat User atau form berubah
  // -------------------------

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

  console.log(User);

  return (
    <Card title='General Account Settings'>
      <Form
        form={form} // <-- 5. Pastikan instance form terhubung ke <Form>
        layout='vertical'
        onFinish={onFinish}
        // enableReinitialize dan initialValues dihapus
        // karena sudah ditangani oleh useEffect
      >
        {/* --- Form Items (Tidak perlu diubah) --- */}
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
