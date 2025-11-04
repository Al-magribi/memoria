import { Flex, Spin, Typography } from "antd";
import React from "react";

const LoadingScreen = () => {
  return (
    <Flex
      style={{
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.4)",
      }}
      align='center'
      justify='center'
      gap={24}
      vertical
    >
      <Spin size='large' />
      <Typography style={{ color: "#fff" }}>Memuat Applikasi...</Typography>
    </Flex>
  );
};

export default LoadingScreen;
