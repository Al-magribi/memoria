import React from "react";
import { Card, Row, Col, Image, Typography } from "antd";
import { User } from "../../Dummies"; // Sesuaikan path jika perlu

const { Title } = Typography;

const Photos = () => {
  return (
    <Card>
      <Title level={4}>Photos</Title>
      <Image.PreviewGroup>
        <Row gutter={[8, 8]}>
          {User.photos.map((photoUrl, index) => (
            // Dibuat lebih responsif untuk halaman penuh
            <Col xs={12} sm={8} md={6} key={index}>
              <Image
                src={photoUrl}
                style={{
                  width: "100%",
                  aspectRatio: "1/1",
                  objectFit: "cover",
                  borderRadius: 8,
                }}
              />
            </Col>
          ))}
        </Row>
      </Image.PreviewGroup>
    </Card>
  );
};

export default Photos;
