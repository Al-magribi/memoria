import {
  Card,
  Flex,
  Grid,
  Layout,
  message,
  Spin,
  Typography,
  Result, // <-- Impor komponen Result
  Button, // <-- Impor komponen Button
} from "antd";
import { useActivateMutation } from "../../service/user/ApiUser";
import { useEffect, useCallback } from "react"; // <-- Impor useCallback
import { useNavigate, useParams } from "react-router-dom";

const { Content } = Layout;
const { useBreakpoint } = Grid;

const Activation = () => {
  const navigate = useNavigate();
  const screens = useBreakpoint();
  const { code } = useParams();

  const [activate, { isLoading, data, error, isSuccess }] =
    useActivateMutation();

  // Gunakan useCallback agar fungsi onFinish stabil
  // dan bisa digunakan di dependency array useEffect
  const onFinish = useCallback(() => {
    if (code) {
      activate({ activationCode: code });
    }
  }, [activate, code]);

  // Efek untuk menjalankan aktivasi saat komponen dimuat
  useEffect(() => {
    onFinish();
  }, [onFinish]);

  // Efek untuk menangani hasil (sukses atau eror)
  useEffect(() => {
    if (isSuccess && data) {
      // Tampilkan pesan sukses
      message.success(data.message);

      // Arahkan pengguna setelah 2 detik agar mereka sempat membaca pesan
      const timer = setTimeout(() => {
        navigate("/signin");
      }, 2000);

      // Bersihkan timer jika komponen di-unmount
      return () => clearTimeout(timer);
    }

    if (error && error.data) {
      // Tampilkan pesan eror
      message.error(error.data.message);
    }
  }, [data, error, isSuccess, navigate]);

  // Fungsi untuk me-render konten Card berdasarkan status
  const renderContent = () => {
    // 2. Status Error
    if (error) {
      return (
        <Result
          status='error'
          title='Activation Failed!'
          subTitle={
            error.data?.message ||
            "Something went wrong. Please try again later."
          }
          extra={[
            <Button
              type='primary'
              key='home'
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </Button>,
            <Button key='retry' onClick={onFinish}>
              Try Again
            </Button>,
          ]}
        />
      );
    }

    // 3. Status Sukses
    if (isSuccess) {
      return (
        <Result
          status='success'
          title='Activation Success!'
          subTitle={data?.message}
        />
      );
    }

    // Status default (sebelum loading dimulai)
    return (
      <Flex
        direction='column'
        align='center'
        justify='center'
        style={{ minHeight: 150 }}
      >
        <Spin size='large' />
        <Typography.Text type='secondary' style={{ marginTop: 24 }}>
          Preparing...
        </Typography.Text>
      </Flex>
    );
  };

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
            title='Account Activation'
            style={{
              maxWidth: 400,
              width: "100%",
              boxShadow: screens.xs ? "none" : "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
            loading={isLoading}
          >
            {/* Render konten secara dinamis */}
            {renderContent()}
          </Card>
        </Flex>
      </Content>
    </Layout>
  );
};

export default Activation;
