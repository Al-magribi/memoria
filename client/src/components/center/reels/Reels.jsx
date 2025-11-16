import React, { useState, useMemo, useEffect } from "react";
import { Flex, Avatar, Typography, Button, Spin, Empty, Grid } from "antd";
import {
  HeartOutlined,
  MessageOutlined,
  ShareAltOutlined,
  VideoCameraAddOutlined,
} from "@ant-design/icons";
import Comment from "./Comment";
import ReelModal from "./addReel/ReelModal";
import {
  useGetReelsQuery,
  useCreateReelMutation,
} from "../../../service/reel/ApiReel";
import { useSocket } from "../../../context/SocketContext";

const { Text, Paragraph, Title } = Typography;
const { useBreakpoint } = Grid;

const videoStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover",
};

const overlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  color: "#fff",
};

const bottomOverlayStyle = {
  width: "100%",
  padding: "16px",
  background: "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))",
};

const Reels = () => {
  const socket = useSocket();
  const screens = useBreakpoint();

  const reelContainerStyle = {
    position: "relative",
    width: "100%",
    maxWidth: "380px",
    height: screens.xs ? "740px" : "650px",
    backgroundColor: "#000",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
    scrollSnapAlign: "center",
    flexShrink: 0,
  };

  const [reel, setReel] = useState("");
  const [open, setOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [video, setVideo] = useState(null);
  const [caption, setCaption] = useState("");

  const { data: reels, isLoading, refetch } = useGetReelsQuery();
  const [createReel, { isLoading: isSubmitting }] = useCreateReelMutation();

  const handleOpen = (reel) => {
    setReel(reel);
    setOpen(true);
  };

  const handleClose = () => {
    setReel("");
    setOpen(false);
  };

  const showModal = () => {
    setIsModalOpen(true);
  };

  const handleOk = async () => {
    const formData = new FormData();
    formData.append("video", video);
    formData.append("caption", caption);

    try {
      await createReel(formData).unwrap();
      setIsModalOpen(false);
      setVideo(null);
      setCaption("");
    } catch (error) {
      console.error("Failed to create reel:", error);
    }
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setVideo(null);
    setCaption("");
  };

  useEffect(() => {
    if (socket) {
      const handler = () => {
        refetch();
      };

      socket.on("reel", handler);

      return () => {
        socket.off("reel", handler);
      };
    }
  }, [socket, refetch]);

  const renderReels = () => {
    if (isLoading) return <Spin size='large' />;

    return reels.map((reel) => (
      <div key={reel._id} style={reelContainerStyle}>
        <video
          src={reel.video}
          autoPlay
          muted
          loop
          playsInline
          style={videoStyle}
        />
        <Flex vertical justify='flex-end' style={overlayStyle}>
          <Flex
            align='flex-end'
            justify='space-between'
            style={bottomOverlayStyle}
          >
            <Flex vertical gap='small' style={{ flex: 1, marginRight: "16px" }}>
              <Flex align='center' gap={8}>
                <Avatar src={reel.user.avatar} size={40} />
                <Text strong style={{ color: "#fff", fontSize: "16px" }}>
                  {reel.user.fullName}
                </Text>
              </Flex>
              <Paragraph
                ellipsis={{ rows: 2, expandable: true, symbol: "more" }}
                style={{
                  color: "#fff",
                  marginBottom: 0,
                  fontSize: "14px",
                }}
              >
                {reel.caption}
              </Paragraph>
            </Flex>
            <Flex vertical gap='middle' align='center'>
              <Flex vertical align='center'>
                <Button
                  type='text'
                  shape='circle'
                  icon={
                    <HeartOutlined
                      style={{ color: "#fff", fontSize: "28px" }}
                    />
                  }
                  style={{ height: "48px", width: "48px" }}
                />
                <Text style={{ color: "#fff", fontSize: "12px" }}>
                  {reel.likes.length}
                </Text>
              </Flex>
              <Flex vertical align='center'>
                <Button
                  type='text'
                  shape='circle'
                  icon={
                    <MessageOutlined
                      style={{ color: "#fff", fontSize: "28px" }}
                    />
                  }
                  style={{ height: "48px", width: "48px" }}
                  onClick={() => handleOpen(reel)}
                />
                <Text style={{ color: "#fff", fontSize: "12px" }}>
                  {reel.comments.length}
                </Text>
              </Flex>
              <Flex vertical align='center'>
                <Button
                  type='text'
                  shape='circle'
                  icon={
                    <ShareAltOutlined
                      style={{ color: "#fff", fontSize: "28px" }}
                    />
                  }
                  style={{ height: "48px", width: "48px" }}
                />
                <Text style={{ color: "#fff", fontSize: "12px" }}>Bagikan</Text>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </div>
    ));
  };

  return (
    <Flex
      direction='row'
      gap='large'
      align='center'
      justify='center'
      style={{
        width: "100%",
        height: "calc(100vh - 60px)",
        padding: "24px 0",
        position: "absolute",
        backgroundColor: "#000",
        zIndex: 9,
        bottom: 0,
        left: 0,
        right: 0,
      }}
    >
      <ReelModal
        isModalOpen={isModalOpen}
        handleOk={handleOk}
        handleCancel={handleCancel}
        isSubmitting={isSubmitting}
        video={video}
        setVideo={setVideo}
        caption={caption}
        setCaption={setCaption}
      />

      <Flex
        vertical
        gap='large'
        align='center'
        style={{
          height: "100%",
          overflowY: "auto",
          padding: "8px",
          position: "relative",
        }}
        className='hide-scrollbar'
      >
        {renderReels()}
      </Flex>

      <Button
        onClick={showModal}
        shape='circle'
        style={{
          height: "48px",
          width: "48px",
          position: "absolute",
          top: 45,
          right: screens.xs ? 24 : 540,
        }}
        color='default'
        variant='solid'
        icon={<VideoCameraAddOutlined style={{ fontSize: "28px" }} />}
      />

      {reel && <Comment open={open} reel={reel} onClose={handleClose} />}
    </Flex>
  );
};

export default Reels;
