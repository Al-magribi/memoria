import Posts from "./components/center/posts/Posts";
import { useState, useEffect } from "react";
import Reels from "./components/center/reels/Reels";
import MainLayout from "./components/layout/MainLayout";
import { useSearchEverythingQuery } from "./service/post/ApiPost";
import { useSearchParams } from "react-router-dom";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const postId = searchParams.get("postId");

  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "1";
  });

  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useSearchEverythingQuery(
    { search: searchTerm },
    { skip: !searchTerm }
  );

  useEffect(() => {
    if (postId) {
      // Jika ada postId, JANGAN simpan activeTab, malah hapus saja biar bersih
      localStorage.removeItem("activeTab");
    } else {
      // Jika TIDAK ada postId, baru simpan activeTab
      localStorage.setItem("activeTab", activeTab);
    }
  }, [activeTab, postId]); // Tambahkan postId ke dependency array

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === "activeTab" && e.newValue) {
        setActiveTab(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleTabChange = (key) => {
    setSearchParams({});
    setActiveTab(key);
  };

  return (
    <MainLayout
      activeTab={postId ? "0" : activeTab}
      onTabChange={handleTabChange}
      setSearchTerm={setSearchTerm}
    >
      <div
        style={{
          maxWidth: 800,
          width: "100%",
        }}
      >
        {activeTab === "1" ? (
          <Posts
            results={data}
            searchTerm={searchTerm}
            isLoadingSearch={isLoading} // Kirim status loading pencarian
            postId={postId}
          />
        ) : (
          <Reels />
        )}
      </div>
    </MainLayout>
  );
};

export default Index;
