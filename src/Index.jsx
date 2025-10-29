import { Grid } from "antd";
import Posts from "./components/center/posts/Posts";
import { useState, useEffect } from "react";
import Reels from "./components/center/reels/Reels";
import MainLayout from "./components/layout/MainLayout";

const { useBreakpoint } = Grid;

const Index = () => {
  const screens = useBreakpoint();
  // 1. State dan handler didefinisikan di sini
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "1";
  });

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  useEffect(() => {
    const handleStorageChange = (e) => {
      // Periksa apakah key-nya 'activeTab' dan nilainya baru
      if (e.key === "activeTab" && e.newValue) {
        setActiveTab(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Cleanup listener saat komponen di-unmount
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  return (
    // 2. State dan handler diteruskan sebagai props ke MainLayout
    <MainLayout activeTab={activeTab} onTabChange={handleTabChange}>
      {/* Wrapper untuk membatasi lebar konten */}
      <div
        style={{
          maxWidth: 800,
          width: "100%",
          marginBottom: screens.xs ? 60 : 0,
        }}
      >
        {/* 3. Konten dirender berdasarkan state dari file Index.jsx ini */}
        {activeTab === "1" ? <Posts /> : <Reels />}
      </div>
    </MainLayout>
  );
};

export default Index;
