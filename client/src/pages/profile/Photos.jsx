import React from "react";
import { Card, Row, Col, Image, Typography } from "antd";
import { useGetMyPhotosQuery } from "../../service/user/ApiUser";

const { Title } = Typography;

const Photos = () => {
  const { data, isLoading } = useGetMyPhotosQuery();

  console.log(data);
  return (
    <Card loading={isLoading}>
      <Title level={4}>Photos</Title>
      <Image.PreviewGroup>
        <Row gutter={[8, 8]}>
          {data?.map((item, index) => (
            // Dibuat lebih responsif untuk halaman penuh
            <Col xs={12} sm={8} md={6} key={index}>
              <Image
                src={item.url}
                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  objectFit: "cover",
                  borderRadius: 8,
                }}
                loading='lazy'
              />
            </Col>
          ))}
        </Row>
      </Image.PreviewGroup>
    </Card>
  );
};

export default Photos;
