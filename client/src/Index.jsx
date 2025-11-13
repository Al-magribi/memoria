import { Grid } from "antd";
import Posts from "./components/center/posts/Posts";
import { useState, useEffect } from "react";
import Reels from "./components/center/reels/Reels";
import MainLayout from "./components/layout/MainLayout";
import { useGetAnythingQuery } from "./service/user/ApiUser";

const { useBreakpoint } = Grid;

const Index = () => {
  const screens = useBreakpoint();
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "1";
  });

  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading } = useGetAnythingQuery(
    { search: searchTerm },
    { skip: !searchTerm }
  );

  console.log(data);

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

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
    setActiveTab(key);
  };

  return (
    <MainLayout
      activeTab={activeTab}
      onTabChange={handleTabChange}
      setSearchTerm={setSearchTerm}
    >
      <div
        style={{
          maxWidth: 800,
          width: "100%",
        }}
      >
        {activeTab === "1" ? <Posts /> : <Reels />}
      </div>
    </MainLayout>
  );
};

export default Index;
