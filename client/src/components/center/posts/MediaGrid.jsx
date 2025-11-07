import { useState } from "react";
import { Flex, Typography } from "antd";
import MediaPreview from "./MediaPreview"; // Impor komponen modal baru kita
import { PlayCircleOutlined } from "@ant-design/icons";

const { Title } = Typography;

const MediaGrid = ({ images = [], videos = [] }) => {
  const [preview, setPreview] = useState({
    visible: false,
    startIndex: 0,
  });

  const validImages = (images || []).filter((img) => img && img.url);
  const validVideos = (videos || []).filter((vid) => vid && vid.url);

  // 'allMedia' adalah sumber kebenaran untuk preview
  const allMedia = [
    ...validImages.map((img) => ({ ...img, type: "image" })),
    ...validVideos.map((vid) => ({ ...vid, type: "video" })),
  ];

  const totalMedia = allMedia.length;

  // Fungsi ini mencari index media yang diklik dan membuka modal
  const handleGridClick = (media) => {
    const mediaIndex = allMedia.findIndex((m) => m.url === media.url);
    if (mediaIndex !== -1) {
      setPreview({ visible: true, startIndex: mediaIndex });
    }
  };

  // --- PERBAIKAN ADA DI SINI ---
  const renderMediaItem = (media) => {
    // Style ini membuat semua media (gambar/video) mengisi 'cover'
    const style = {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      display: "block",
    };

    if (media.type === "image") {
      return (
        <img src={media.url} alt={media.alt || "post image"} style={style} />
      );
    }

    if (media.type === "video") {
      // Hapus 'controls' dan 'onClick' dari video di grid.
      // Ini menjadikannya thumbnail yang bisa diklik,
      // sama seperti gambar.
      return (
        <>
          <video
            // HAPUS: controls
            src={media.url}
            style={style}
            muted // 'muted' sering diperlukan agar beberapa browser mau render frame pertama
            preload="metadata" // Hanya load info dasar, bukan seluruh video
            // HAPUS: onClick={(e) => e.stopPropagation()}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              color: "white",
              fontSize: "48px",
              pointerEvents: "none",
            }}
          >
            <PlayCircleOutlined />
          </div>
        </>
      );
    }
    return null;
  };
  // --- AKHIR PERBAIKAN ---

  const visibleMedia = allMedia.slice(0, 4);
  const remainingCount = totalMedia - visibleMedia.length;

  return (
    <>
      <Flex gap={8} style={{ marginTop: 16 }}>
        {visibleMedia.map((media, index) => (
          <div
            key={index}
            className="media-grid-item"
            style={{
              position: "relative",
              cursor: "pointer", // Kursor pointer untuk SEMUA item
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "8px",
              overflow: "hidden",
            }}
            // 'onClick' ini sekarang akan berfungsi untuk gambar DAN video
            onClick={() => handleGridClick(media)}
          >
            {renderMediaItem(media)}

            {index === 3 && remainingCount > 0 && (
              <Flex
                align="center"
                justify="center"
                style={{
                  position: "absolute",
                  top: "2px",
                  left: "2px",
                  right: "2px",
                  bottom: "2px",
                  backgroundColor: "rgba(0, 0, 0, 0.5)",
                  borderRadius: "8px",
                  pointerEvents: "none",
                }}
              >
                <Title level={2} style={{ color: "white", margin: 0 }}>
                  +{remainingCount}
                </Title>
              </Flex>
            )}
          </div>
        ))}
      </Flex>

      {/* Komponen MediaPreview kustom kita */}
      <MediaPreview
        visible={preview.visible}
        onClose={() => setPreview((p) => ({ ...p, visible: false }))}
        mediaItems={allMedia} // Berikan SEMUA media
        startIndex={preview.startIndex}
      />
    </>
  );
};

export default MediaGrid;
