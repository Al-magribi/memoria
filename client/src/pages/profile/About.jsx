import React, { useState } from "react";
import { Card, List, Typography, message, Skeleton, Select, Space, Button } from "antd";
import {
  HomeOutlined,
  GlobalOutlined,
  CalendarOutlined,
  TagOutlined,
  EditOutlined,
  HeartOutlined,
} from "@ant-design/icons";
import { useParams } from "react-router-dom";
import {
  useGetProfileQuery,
  useUpdateDetailsMutation,
} from "../../service/user/ApiUser";

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const relationshipStatusOptions = [
  "Single",
  "In a relationship",
  "Engaged",
  "Married",
  "It's complicated",
  "In an open relationship",
  "Widowed",
  "Separated",
  "Divorced",
];

const About = () => {
  const { username } = useParams();
  const { data: user, isLoading } = useGetProfileQuery(username);
  const [updateDetails, { isLoading: isUpdating }] = useUpdateDetailsMutation();

  const [isEditingRelationship, setIsEditingRelationship] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState("");

  const handleUpdate = async (field, value) => {
    try {
      await updateDetails({ [field]: value }).unwrap();
      message.success(`${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`);
    } catch (error) {
      message.error(`Failed to update ${field}`);
    }
  };

  const handleRelationshipSave = async () => {
    await handleUpdate("relationshipStatus", selectedRelationship);
    setIsEditingRelationship(false);
  };

  const editIcon = <EditOutlined style={{ marginLeft: 8 }} />;

  if (isLoading) {
    return <Skeleton active />;
  }

  return (
    <Card>
      <Title level={4}>About</Title>

      <Paragraph
        editable={user?.isOwner ? {
          icon: editIcon,
          tooltip: "Edit Bio",
          onChange: (newValue) => handleUpdate("bio", newValue),
        } : false}
        style={{ marginBottom: 24, fontStyle: user?.bio ? "normal" : "italic" }}
      >
        {user?.bio || (user?.isOwner ? "Click to add bio" : "No bio yet")}
      </Paragraph>

      <Title level={5}>Details</Title>
      <List itemLayout="horizontal" size="small">
        <List.Item>
          <List.Item.Meta
            avatar={<TagOutlined style={{ fontSize: 20 }} />}
            description={
              <Text
                editable={user?.isOwner ? {
                  icon: editIcon,
                  tooltip: "Edit Work",
                  onChange: (newValue) => handleUpdate("worksAt", newValue),
                }: false}
              >
                {user?.details?.worksAt ? `Works as ${user.details.worksAt}` : (user?.isOwner ? "Add work" : "Not specified")}
              </Text>
            }
          />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            avatar={<HomeOutlined style={{ fontSize: 20 }} />}
            description={
              <Text
                editable={user?.isOwner ? {
                  icon: editIcon,
                  tooltip: "Edit Location",
                  onChange: (newValue) => handleUpdate("livesIn", newValue),
                } : false}
              >
                {user?.details?.livesIn ? `Lives in ${user.details.livesIn}` : (user?.isOwner ? "Add location" : "Not specified")}
              </Text>
            }
          />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            avatar={<GlobalOutlined style={{ fontSize: 20 }} />}
            description={
              <Text
                editable={user?.isOwner ? {
                  icon: editIcon,
                  tooltip: "Edit Hometown",
                  onChange: (newValue) => handleUpdate("from", newValue),
                } : false}
              >
                {user?.details?.from ? `From ${user.details.from}` : (user?.isOwner ? "Add hometown" : "Not specified")}
              </Text>
            }
          />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            avatar={<HeartOutlined style={{ fontSize: 20 }} />}
            description={
              isEditingRelationship && user?.isOwner ? (
                <Space>
                  <Select
                    defaultValue={user?.details?.relationshipStatus || "Single"}
                    onChange={(value) => setSelectedRelationship(value)}
                    style={{ width: 200 }}
                  >
                    {relationshipStatusOptions.map(option => (
                      <Option key={option} value={option}>{option}</Option>
                    ))}
                  </Select>
                  <Button type="primary" onClick={handleRelationshipSave} loading={isUpdating}>Save</Button>
                  <Button onClick={() => setIsEditingRelationship(false)}>Cancel</Button>
                </Space>
              ) : (
                <Text>
                  {user?.details?.relationshipStatus || (user?.isOwner ? "Add relationship status" : "Not specified")}
                  {user?.isOwner && <EditOutlined style={{ marginLeft: 8, cursor: 'pointer' }} onClick={() => {
                    setSelectedRelationship(user?.details?.relationshipStatus || 'Single');
                    setIsEditingRelationship(true)
                    }} />}
                </Text>
              )
            }
          />
        </List.Item>
        <List.Item>
          <List.Item.Meta
            avatar={<CalendarOutlined style={{ fontSize: 20 }} />}
            description={<Text>Joined {new Date(user?.details?.joined).toLocaleDateString()}</Text>}
          />
        </List.Item>
      </List>
    </Card>
  );
};

export default About;