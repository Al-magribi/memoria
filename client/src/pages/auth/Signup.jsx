import React, { useEffect } from "react";
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Flex,
  message,
  Grid,
  DatePicker,
  Select,
} from "antd";
import { LockOutlined, MailOutlined, UserOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { useSignupMutation } from "../../service/user/ApiUser";

const { Text, Link } = Typography;
const { Content } = Layout;
const { useBreakpoint } = Grid;

const Signup = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const screens = useBreakpoint();

  // Fungsi untuk menghitung umur
  const calculateAge = (birthDate) => {
    const today = dayjs();
    return today.diff(birthDate, "year");
  };

  // Handler untuk form REGISTER (Sign Up)
  const [
    signup,
    {
      isLoading: isLoadingSignup,
      data: signupData,
      error: signupError,
      isSuccess: isSignupSuccess,
    },
  ] = useSignupMutation();

  const onFinish = (values) => {
    // Validasi usia
    const age = calculateAge(values.dob);
    if (age < 18) {
      message.error("you are under-age to this platform");
      return; // Hentikan submit
    }
    signup(values);
  };

  useEffect(() => {
    if (isSignupSuccess) {
      message.success(signupData.message);
      form.resetFields();
    }

    if (signupError) {
      message.error(signupError.data.message);
    }
  }, [signupData, signupError, isSignupSuccess, navigate, form]);

  return (
    <Layout style={{ minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
      <Content>
        <Flex
          align='center'
          justify='center'
          style={{
            minHeight: "100vh",
            padding: screens.xs ? "16px" : 0,
          }}
        >
          <Card
            style={{
              maxWidth: 400,
              width: "100%",
              boxShadow: screens.xs ? "none" : "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Flex vertical align='center'>
              <img
                src='/logo.png'
                alt='Memoria'
                style={{ width: 44, marginBottom: 16 }}
              />

              <Text type='secondary' style={{ marginBottom: 14 }}>
                Join Memoria today!
              </Text>
            </Flex>

            <Form
              form={form}
              name='register'
              onFinish={onFinish}
              layout='vertical'
            >
              {/* --- Kolom khusus REGISTER --- */}
              <Form.Item
                name='firstName'
                label='First Name'
                rules={[
                  {
                    required: true,
                    message: "Please input your First Name!",
                  },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder='First Name' />
              </Form.Item>

              <Form.Item
                name='lastName'
                label='Last Name'
                rules={[
                  {
                    required: true,
                    message: "Please input your Last Name!",
                  },
                ]}
              >
                <Input prefix={<UserOutlined />} placeholder='Last Name' />
              </Form.Item>

              <Form.Item
                name='gender'
                label='Select Gender'
                rules={[
                  { required: true, message: "Please select your gender!" },
                ]}
              >
                <Select
                  options={[
                    { label: "Male", value: "Male" },
                    { label: "Female", value: "Female" },
                  ]}
                  placeholder='Select Gender'
                />
              </Form.Item>

              <Form.Item
                name='dob'
                label='Date of Birth'
                rules={[
                  {
                    required: true,
                    message: "Please select your Date of Birth!",
                  },
                ]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  placeholder='Select your date of birth'
                />
              </Form.Item>

              {/* --- Kolom BERSAMA (Login & Register) --- */}
              <Form.Item
                name='email'
                label='Email'
                rules={[
                  { required: true, message: "Please input your Email!" },
                  { type: "email", message: "The input is not valid E-mail!" },
                ]}
              >
                <Input prefix={<MailOutlined />} placeholder='Email' />
              </Form.Item>

              <Form.Item
                name='password'
                label='Password'
                rules={[
                  { required: true, message: "Please input your Password!" },
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  type='password'
                  placeholder='Password'
                />
              </Form.Item>

              {/* --- Tombol Submit --- */}
              <Form.Item style={{ marginTop: 16 }}>
                <Button
                  type='primary'
                  htmlType='submit'
                  block
                  loading={isLoadingSignup}
                >
                  Sign up
                </Button>
              </Form.Item>

              {/* --- Link Toggler --- */}
              <Flex justify='center'>
                <Text>
                  Already have an account? {/* Ganti ke Link Href */}
                  <Link href='/signin'>Sign in</Link>
                </Text>
              </Flex>
            </Form>
          </Card>
        </Flex>
      </Content>
    </Layout>
  );
};

export default Signup;
