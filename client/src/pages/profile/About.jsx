import React, { useState } from "react";
import { Card, List, Typography, message } from "antd"; // 1. Impor 'message'
import {
  HomeOutlined,
  GlobalOutlined,
  CalendarOutlined,
  TagOutlined,
  EditOutlined,
} from "@ant-design/icons";
import { User } from "../../Dummies"; // Sesuaikan path jika perlu

const { Title, Text, Paragraph } = Typography;

const About = () => {
  const [bio, setBio] = useState(User.bio);
  const [worksAt, setWorksAt] = useState(User.details.worksAt);
  const [livesIn, setLivesIn] = useState(User.details.livesIn);
  const [from, setFrom] = useState(User.details.from);

  const editIcon = <EditOutlined style={{ marginLeft: 8 }} />;

  return (
    <Card>
      <Title level={4}>About</Title>

      <Paragraph
        editable={{
          icon: editIcon,
          tooltip: "Edit Bio",
          // 2. Ubah onChange untuk menyertakan message
          onChange: (newValue) => {
            setBio(newValue);
            message.success("Bio berhasil diperbarui");
          },
        }}
        style={{ marginBottom: 24, fontStyle: bio ? "normal" : "italic" }}
      >
        {bio || "Click to add bio"}
      </Paragraph>

      <Title level={5}>Details</Title>
      <List itemLayout="horizontal" size="small">
        <List.Item>
          <List.Item.Meta
            avatar={<TagOutlined style={{ fontSize: 20 }} />}
            description={
              <Text
                editable={{
                  icon: editIcon,
                  tooltip: "Edit Work",
                  // 2. Ubah onChange untuk menyertakan message
                  onChange: (newValue) => {
                    setWorksAt(newValue);
                    message.success("Pekerjaan berhasil diperbarui");
                  },
                }}
              >
                {worksAt ? `Works as ${worksAt}` : "Add work"}
              </Text>
            }
          />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            avatar={<HomeOutlined style={{ fontSize: 20 }} />}
            description={
              <Text
                editable={{
                  icon: editIcon,
                  tooltip: "Edit Location",
                  // 2. Ubah onChange untuk menyertakan message
                  onChange: (newValue) => {
                    setLivesIn(newValue);
                    message.success("Lokasi berhasil diperbarui");
                  },
                }}
              >
                {livesIn ? `Lives in ${livesIn}` : "Add location"}
              </Text>
            }
          />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            avatar={<GlobalOutlined style={{ fontSize: 20 }} />}
            description={
              <Text
                editable={{
                  icon: editIcon,
                  tooltip: "Edit Hometown",
                  // 2. Ubah onChange untuk menyertakan message
                  onChange: (newValue) => {
                    setFrom(newValue);
                    message.success("Asal berhasil diperbarui");
                  },
                }}
              >
                {from ? `From ${from}` : "Add hometown"}
              </Text>
            }
          />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            avatar={<CalendarOutlined style={{ fontSize: 20 }} />}
            description={<Text>Joined {User.details.joined}</Text>}
          />
        </List.Item>
      </List>
    </Card>
  );
};

export default About;
