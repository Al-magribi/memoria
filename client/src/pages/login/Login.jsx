import React, { useState } from "react"; // 1. Impor useState
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  Flex,
  message,
  Grid,
  DatePicker, // 2. Impor baru
} from "antd";
import {
  LockOutlined,
  MailOutlined,
  UserOutlined, // 3. Impor baru
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs"; // 4. Impor baru
import { useLoginMutation } from "../../service/user/ApiUser";
import { isAuthenticated, setAuthenticated } from "../../utils/auth";
import { useEffect } from "react";

const { Title, Text, Link } = Typography;
const { Content } = Layout;
const { useBreakpoint } = Grid;

const Login = () => {
  // 5. State untuk mengontrol mode form ('login' atau 'register')
  const [formMode, setFormMode] = useState("login");
  const [form] = Form.useForm(); // 6. Form instance untuk reset
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const [login, { isLoading }] = useLoginMutation();

  // Fungsi untuk menghitung umur
  const calculateAge = (birthDate) => {
    const today = dayjs();
    return today.diff(birthDate, "year");
  };

  // 7. Handler untuk form LOGIN
  const onFinishLogin = async (values) => {
    try {
      const { data } = await login(values).unwrap();
      setAuthenticated();
      message.success("Login Successful! Redirecting...");
      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (error) {
      message.error(error.data.message);
    }
  };

  // 8. Handler untuk form REGISTER (Sign Up)
  const onFinishRegister = (values) => {
    // Validasi usia
    const age = calculateAge(values.dob);
    if (age < 18) {
      message.error(
        "Usia tidak mencukupi. Anda harus berusia minimal 18 tahun."
      );
      return; // Hentikan submit
    }

    console.log("Register values: ", values);
    message.success("Registration Successful! Please log in.");
    // Setelah daftar, arahkan kembali ke mode login
    setFormMode("login");
    form.resetFields();
  };

  // 9. Fungsi untuk ganti mode
  const toggleFormMode = () => {
    setFormMode(formMode === "login" ? "register" : "login");
    form.resetFields(); // Bersihkan input saat ganti mode
  };

  // 10. Tentukan handler mana yang akan digunakan
  const onFinish = formMode === "login" ? onFinishLogin : onFinishRegister;

  // Periksa otentikasi
  const isSignin = isAuthenticated();

  useEffect(() => {
    if (isSignin) {
      navigate("/");
    }
  }, [isSignin]);

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
              padding: "16px",
            }}
          >
            <Flex vertical align='center'>
              <img
                src='/logo.png'
                alt='Memoria'
                style={{ width: 44, marginBottom: 16 }}
              />

              <Text type='secondary' style={{ marginBottom: 14 }}>
                {formMode === "login"
                  ? "Welcome back! Please enter your details."
                  : "Join Memoria today!"}
              </Text>
            </Flex>

            <Form
              form={form} // 12. Kaitkan form instance
              name={formMode} // Nama form dinamis
              onFinish={onFinish} // Handler dinamis
              initialValues={{ remember: formMode === "login" }}
              layout='vertical' // Layout vertical agar rapi dengan label
              size='small'
            >
              {/* 13. --- Kolom khusus REGISTER --- */}
              {formMode === "register" && (
                <>
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
                    <Input
                      prefix={<UserOutlined />}
                      placeholder='First Name'
                      size='large'
                    />
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
                    <Input
                      prefix={<UserOutlined />}
                      placeholder='Last Name'
                      size='large'
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
                      size='large'
                    />
                  </Form.Item>
                </>
              )}

              {/* 14. --- Kolom BERSAMA (Login & Register) --- */}
              <Form.Item
                name='email'
                label='Email'
                rules={[
                  { required: true, message: "Please input your Email!" },
                  { type: "email", message: "The input is not valid E-mail!" },
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder='Email'
                  size='large'
                />
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
                  size='large'
                />
              </Form.Item>

              {/* 15. --- Kolom khusus LOGIN --- */}
              {formMode === "login" && (
                <Form.Item>
                  <Flex justify='space-between' align='center'>
                    <Form.Item name='remember' valuePropName='checked' noStyle>
                      <Checkbox>Remember me</Checkbox>
                    </Form.Item>
                    <Link href='#'>Forgot password?</Link>
                  </Flex>
                </Form.Item>
              )}

              {/* 16. --- Tombol Submit Dinamis --- */}
              <Form.Item style={{ marginTop: 16 }}>
                <Button
                  type='primary'
                  htmlType='submit'
                  block
                  size='large'
                  loading={isLoading}
                >
                  {formMode === "login" ? "Log in" : "Sign up"}
                </Button>
              </Form.Item>

              {/* 17. --- Link Toggler Dinamis --- */}
              <Flex justify='center'>
                <Text>
                  {formMode === "login"
                    ? "Don't have an account? "
                    : "Already have an account? "}
                  <Link onClick={toggleFormMode}>
                    {formMode === "login" ? "Sign up" : "Log in"}
                  </Link>
                </Text>
              </Flex>
            </Form>
          </Card>
        </Flex>
      </Content>
    </Layout>
  );
};

export default Login;
