import React, { useState } from "react";
import { Flex, Avatar, Typography, Button } from "antd";
import {
  HeartOutlined,
  MessageOutlined,
  ShareAltOutlined,
} from "@ant-design/icons";
import { ReelsList } from "../../../Dummies"; // Pastikan path ini benar
import Comment from "./Comment";

const { Text, Paragraph } = Typography;

// Gaya untuk setiap item Reel
const reelContainerStyle = {
  position: "relative",
  width: "100%",
  maxWidth: "400px", // Menyerupai lebar feed mobile
  height: "700px", // Tinggi yang umum untuk video 9:16
  maxHeight: "85vh", // Batas agar pas di layar
  backgroundColor: "#000",
  borderRadius: "16px", // Facebook reels memiliki sudut membulat
  overflow: "hidden", // Memastikan video tidak keluar dari border radius
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
};

// Gaya untuk video di dalam kontainer
const videoStyle = {
  width: "100%",
  height: "100%",
  objectFit: "cover", // Memastikan video mengisi kontainer tanpa distorsi
};

// Gaya untuk lapisan overlay
const overlayStyle = {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  color: "#fff", // Teks akan berwarna putih
};

// Gaya untuk bagian bawah overlay (info & aksi)
const bottomOverlayStyle = {
  width: "100%",
  padding: "16px",
  // Gradient agar teks lebih mudah dibaca di atas video
  background: "linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0))",
};

const Reels = () => {
  const [reel, setReel] = useState("");
  const [open, setOpen] = useState(false);

  const handleOpen = (reel) => {
    setReel(reel);
    setOpen(true);
  };

  const handleClose = () => {
    setReel("");
    setOpen(false);
  };

  return (
    // Flex vertical untuk menumpuk Reels dan menengahkan
    <Flex
      vertical
      gap="large"
      align="center"
      style={{ width: "100%", padding: "24px 0" }}
    >
      {ReelsList.map((reel) => (
        // Kontainer utama untuk setiap reel
        <div key={reel.id} style={reelContainerStyle}>
          {/* Video Player */}
          <video
            src={reel.video}
            autoPlay
            muted // AutoPlay biasanya memerlukan muted
            loop
            playsInline // Penting untuk pemutaran di browser mobile
            style={videoStyle}
            // Hapus 'controls' untuk UI kustom penuh
          />

          {/* Lapisan Overlay UI */}
          <Flex
            vertical
            justify="flex-end" // Dorong semua konten ke bawah
            style={overlayStyle}
          >
            {/* Konten Bawah (Info & Aksi) */}
            <Flex
              align="flex-end" // Ratakan info (kiri) dan aksi (kanan) ke bawah
              justify="space-between" // Pisahkan info dan aksi
              style={bottomOverlayStyle}
            >
              {/* Kiri: Info Pengguna & Caption */}
              <Flex
                vertical
                gap="small"
                style={{ flex: 1, marginRight: "16px" }}
              >
                <Flex align="center" gap={8}>
                  <Avatar src={reel.avatar} size={40} />
                  <Text strong style={{ color: "#fff", fontSize: "16px" }}>
                    {reel.username}
                  </Text>
                </Flex>
                <Paragraph
                  ellipsis={{ rows: 2, expandable: true, symbol: "more" }}
                  style={{ color: "#fff", marginBottom: 0, fontSize: "14px" }}
                >
                  {reel.caption}
                </Paragraph>
              </Flex>

              {/* Kanan: Tombol Aksi (Vertikal) */}
              <Flex vertical gap="middle" align="center">
                {/* Tombol Like */}
                <Flex vertical align="center">
                  <Button
                    type="text"
                    shape="circle"
                    icon={
                      <HeartOutlined
                        style={{ color: "#fff", fontSize: "28px" }}
                      />
                    }
                    style={{ height: "48px", width: "48px" }}
                  />
                  <Text style={{ color: "#fff", fontSize: "12px" }}>
                    {reel.likes}
                  </Text>
                </Flex>

                {/* Tombol Komentar */}
                <Flex vertical align="center">
                  <Button
                    type="text"
                    shape="circle"
                    icon={
                      <MessageOutlined
                        style={{ color: "#fff", fontSize: "28px" }}
                      />
                    }
                    style={{ height: "48px", width: "48px" }}
                    onClick={() => handleOpen(reel)}
                  />
                  <Text style={{ color: "#fff", fontSize: "12px" }}>
                    {reel.comments}
                  </Text>
                </Flex>

                {/* Tombol Bagikan */}
                <Flex vertical align="center">
                  <Button
                    type="text"
                    shape="circle"
                    icon={
                      <ShareAltOutlined
                        style={{ color: "#fff", fontSize: "28px" }}
                      />
                    }
                    style={{ height: "48px", width: "48px" }}
                  />
                  <Text style={{ color: "#fff", fontSize: "12px" }}>
                    Bagikan
                  </Text>
                </Flex>
              </Flex>
            </Flex>
          </Flex>
        </div>
      ))}

      <Comment open={open} comments={reel.commentsData} onClose={handleClose} />
    </Flex>
  );
};

export default Reels;
