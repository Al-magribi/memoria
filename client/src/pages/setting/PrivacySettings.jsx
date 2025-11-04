import React, { useEffect } from "react"; // <-- 1. Import useEffect
import { Form, Select, Switch, Button, Card, message, Typography } from "antd";
import { useUpdatePrivacyMutation } from "../../service/user/ApiUser";

const { Option } = Select;
const { Title, Text } = Typography;

const PrivacySettings = ({ User }) => {
  const [updatePrivacy, { data, error, isLoading, isSuccess, reset }] =
    useUpdatePrivacyMutation();
  // 2. Dapatkan instance form
  const [form] = Form.useForm();

  // 3. Tambahkan hook useEffect
  // Ini akan berjalan setiap kali prop 'User' berubah
  useEffect(() => {
    // Cek jika data User dan User.privacy sudah ada
    // (sesuai console log Anda)
    if (User?.privacy) {
      // 4. PAKSA form untuk diisi dengan data yang baru datang
      form.setFieldsValue(User.privacy);
    }
  }, [User, form]); // <-- Dependencies: jalankan saat User atau form berubah

  const onFinish = (values) => {
    updatePrivacy(values);
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
    <Card title='Privacy Settings'>
      <Form
        form={form} // <-- 5. Pastikan instance form terhubung ke <Form>
        layout='vertical'
        onFinish={onFinish}
        // initialValues tidak lagi diandalkan untuk data yang datang terlambat
      >
        <Title level={5}>Profile Privacy Controls</Title>

        {/* Nama field (e.g., 'showProfile') sudah cocok 
            dengan key di data privacy Anda */}
        <Form.Item name='showProfile' label='Who can see your profile?'>
          <Select>
            <Option value='public'>Public</Option>
            <Option value='friends'>Friends</Option>
            <Option value='private'>Only Me</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name='whoCanSeeFriendsList'
          label='Who can see your friends list?'
        >
          <Select>
            <Option value='public'>Public</Option>
            <Option value='friends'>Friends</Option>
            <Option value='private'>Only Me</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name='whoCanSendFriendRequest'
          label='Who can send you friend requests?'
        >
          <Select>
            <Option value='everyone'>Everyone</Option>
            <Option value='friends_of_friends'>Friends of Friends</Option>
          </Select>
        </Form.Item>

        <Title level={5} style={{ marginTop: "24px" }}>
          Contact Info Controls
        </Title>

        <Form.Item name='whoCanSeePhone' label='Who can see your phone number?'>
          <Select>
            <Option value='public'>Public</Option>
            <Option value='friends'>Friends</Option>
            <Option value='private'>Only Me</Option>
          </Select>
        </Form.Item>

        <Form.Item name='whoCanSeeDOB' label='Who can see your date of birth?'>
          <Select>
            <Option value='public'>Public (Day, Month, Year)</Option>
            <Option value='friends'>Friends (Day, Month, Year)</Option>
            <Option value='only_month_day'>Friends (Only Day & Month)</Option>
            <Option value='private'>Only Me</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name='showEmail'
          label='Show your email on your public profile?'
          // valuePropName="checked" penting untuk Switch di antd Form
          valuePropName='checked'
        >
          <Switch checkedChildren='Yes' unCheckedChildren='No' />
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

export default PrivacySettings;
