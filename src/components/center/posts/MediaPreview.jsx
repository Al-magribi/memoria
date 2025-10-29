// MediaPreview.jsx
import { useState, useEffect } from "react";
import { Modal, Button, Flex } from "antd";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

const MediaPreview = ({
  visible,
  onClose,
  mediaItems = [],
  startIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(startIndex);

  // Efek ini akan me-reset index ke 'startIndex' setiap kali modal dibuka
  useEffect(() => {
    if (visible) {
      setCurrentIndex(startIndex);
    }
  }, [visible, startIndex]);

  // Pastikan kita memiliki media untuk ditampilkan
  if (!mediaItems || mediaItems.length === 0) {
    return null;
  }

  const totalItems = mediaItems.length;
  const currentItem = mediaItems[currentIndex];

  const goToPrev = (e) => {
    e.stopPropagation(); // Mencegah klik "tembus" ke modal
    setCurrentIndex((prev) => (prev - 1 + totalItems) % totalItems);
  };

  const goToNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % totalItems);
  };

  // Gaya untuk tombol navigasi (mirip AntD)
  const navButtonStyle = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 1300, // Di atas konten modal
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    color: "white",
    border: "none", // Menghilangkan border pada tombol juga
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null} // Tidak perlu footer (tombol OK/Cancel)
      centered
      width='90vw'
      destroyOnHidden={true}
      styles={{
        body: {
          padding: 0,
          height: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
        // --- PERUBAHAN DI SINI: Atur background konten modal ---
        content: {
          background: "transparent", // Menghilangkan latar belakang putih
          boxShadow: "none", // Menghilangkan shadow jika ada
          padding: 0, // Pastikan padding juga 0
        },
      }}
    >
      <Flex
        justify='center'
        align='center'
        style={{ height: "100%", width: "100%", position: "relative" }}
      >
        {/* Konten Media (Gambar atau Video) */}
        {currentItem.type === "image" && (
          <img
            src={currentItem.url}
            alt={currentItem.alt || "preview"}
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
          />
        )}
        {currentItem.type === "video" && (
          <video
            src={currentItem.url}
            controls
            autoPlay
            style={{
              maxWidth: "100%",
              maxHeight: "100%",
              objectFit: "contain",
            }}
            onClick={(e) => e.stopPropagation()}
          />
        )}

        {/* Tombol Navigasi (hanya tampil jika > 1 media) */}
        {totalItems > 1 && (
          <>
            <Button
              type='primary'
              shape='circle'
              icon={<LeftOutlined />}
              onClick={goToPrev}
              style={{ ...navButtonStyle, left: 24 }}
            />
            <Button
              type='primary'
              shape='circle'
              icon={<RightOutlined />}
              onClick={goToNext}
              style={{ ...navButtonStyle, right: 24 }}
            />
          </>
        )}
      </Flex>
    </Modal>
  );
};

export default MediaPreview;
