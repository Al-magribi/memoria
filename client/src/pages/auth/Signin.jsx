import React, { useEffect } from "react";
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
} from "antd";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useLoginMutation } from "../../service/user/ApiUser";
import { isAuthenticated, setSignIn } from "../../utils/auth";
import { useDispatch } from "react-redux";
import { setUser } from "../../service/user/SliceUser";

const { Text, Link } = Typography;
const { Content } = Layout;
const { useBreakpoint } = Grid;

const Signin = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const dispatch = useDispatch();

  // Handler untuk form LOGIN
  const [
    login,
    {
      isLoading: isLoadingLogin,
      data: loginData,
      error: loginError,
      isSuccess: isLoginSuccess,
    },
  ] = useLoginMutation();

  const onFinish = async (values) => {
    login(values);
  };

  useEffect(() => {
    if (isLoginSuccess) {
      message.success(loginData.message);
      setSignIn();
      dispatch(
        setUser({
          username: loginData.username,
          fullName: loginData.fullName,
          avatar: loginData.avatar,
        })
      );
      navigate("/");
    }

    if (loginError) {
      message.error(loginError.data.message);
    }
  }, [loginData, loginError, isLoginSuccess, navigate, dispatch]);

  // Periksa otentikasi
  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);

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
                Welcome back! Please enter your details.
              </Text>
            </Flex>

            <Form
              name='login'
              onFinish={onFinish}
              initialValues={{ remember: true }}
              layout='vertical'
              size='small'
            >
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

              <Form.Item>
                <Flex justify='space-between' align='center'>
                  <Form.Item name='remember' valuePropName='checked' noStyle>
                    <Checkbox>Remember me</Checkbox>
                  </Form.Item>
                  <Link href='#'>Forgot password?</Link>
                </Flex>
              </Form.Item>

              <Form.Item style={{ marginTop: 16 }}>
                <Button
                  type='primary'
                  htmlType='submit'
                  block
                  size='large'
                  loading={isLoadingLogin}
                >
                  Sign in
                </Button>
              </Form.Item>

              <Flex justify='center'>
                <Text>
                  Don't have an account? {/* Ganti ke Link Href */}
                  <Link href='/signup'>Sign up</Link>
                </Text>
              </Flex>
            </Form>
          </Card>
        </Flex>
      </Content>
    </Layout>
  );
};

export default Signin;
