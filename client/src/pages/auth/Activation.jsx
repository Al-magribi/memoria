import {
  Button,
  Card,
  Flex,
  Form,
  Grid,
  Input,
  Layout,
  message,
  Select,
} from "antd";
import { useActivateMutation } from "../../service/user/ApiUser";
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const { Content } = Layout;
const { useBreakpoint } = Grid;

const Activation = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const { code } = useParams();

  const [form] = Form.useForm();
  const [activate, { isLoading, data, error, isSuccess }] =
    useActivateMutation();

  const onFinish = (values) => {
    values.activationCode = code;
    activate(values);
  };

  useEffect(() => {
    if (isSuccess) {
      message.success(data.message);
      form.resetFields();
      navigate("/signin");
    }

    if (error) {
      message.error(error.data.message);
      navigate("/signin");
    }
  }, [data, error, isSuccess]);

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
            title='Activation Account'
            style={{
              maxWidth: 400,
              width: "100%",
              boxShadow: screens.xs ? "none" : "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Form layout='vertical' onFinish={onFinish}>
              <Form.Item
                name='username'
                label='Username'
                rules={[
                  { required: true, message: "Please input your username!" },
                ]}
              >
                <Input placeholder='username' />
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

              <Form.Item style={{ marginTop: 16 }}>
                <Button
                  type='primary'
                  htmlType='submit'
                  block
                  size='large'
                  loading={isLoading}
                >
                  Activate
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Flex>
      </Content>
    </Layout>
  );
};

export default Activation;
