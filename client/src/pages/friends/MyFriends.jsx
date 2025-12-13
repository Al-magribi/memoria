import React, { useState, useEffect, useRef, useCallback } from "react";
import { Row, Col, Typography, Spin, Empty, Divider, message } from "antd"; // Tambah message
import UserCard from "./UserCard";
import {
  useGetMyFriendsQuery,
  useRemoveFriendMutation,
} from "../../service/friends/ApiFriend";
import { useSocket } from "../../context/SocketContext";

const { Title } = Typography;

const MyFriends = () => {
  const socket = useSocket();
  const [page, setPage] = useState(1);
  const [allFriends, setAllFriends] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const [removeFriend] = useRemoveFriendMutation();

  const {
    data: friendsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetMyFriendsQuery({
    page: page,
    limit: 8,
  });

  // --- LOGIKA BARU: Optimistic Remove ---
  const handleRemoveLocal = async (userId) => {
    // 1. Update UI Instan: Hapus teman dari list state lokal
    setAllFriends((prev) => prev.filter((user) => user._id !== userId));

    try {
      // 2. Kirim request ke server
      await removeFriend(userId).unwrap();
      message.success("Friend removed.");
    } catch (error) {
      // 3. Jika gagal, refetch untuk mengembalikan data
      console.error("Failed to remove friend:", error);
      message.error("Failed to remove friend.");
      refetch();
    }
  };
  // --------------------------------------

  // Efek untuk mengakumulasi data paginasi
  useEffect(() => {
    if (friendsData?.hasMore !== undefined) {
      setHasMore(friendsData.hasMore);
    }
    const newFriends = friendsData?.friends || [];
    if (newFriends.length > 0) {
      if (page === 1) {
        setAllFriends(newFriends);
      } else {
        setAllFriends((prev) => {
          const existingIds = new Set(prev.map((u) => u._id));
          const newUsersToAdd = newFriends.filter(
            (u) => !existingIds.has(u._id)
          );
          return [...prev, ...newUsersToAdd];
        });
      }
    } else if (page === 1) {
      setAllFriends([]);
    }
  }, [friendsData, page]);

  // Efek untuk socket listener
  useEffect(() => {
    if (socket) {
      const handleNotification = (data) => {
        // Logika tambahan: Jika user ini dihapus oleh orang lain, refresh list
        // (Pastikan backend mengirim action 'was_removed_as_friend' seperti di perbaikan backend sebelumnya)
        setPage(1);
        refetch();
      };
      socket.on("notification", handleNotification);
      return () => {
        socket.off("notification", handleNotification);
      };
    }
  }, [socket, refetch]);

  // Logika Infinite Scroll
  const observer = useRef();
  const lastElementRef = useCallback(
    (node) => {
      if (isFetching) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prev) => prev + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [isFetching, hasMore]
  );

  if (isLoading && page === 1) {
    return <Spin style={{ display: "block", margin: "auto" }} />;
  }

  return (
    <>
      <Title level={4} style={{ marginTop: 0 }}>
        Your Friends
      </Title>
      <Row gutter={[16, 16]}>
        {allFriends.length > 0
          ? allFriends.map((user, index) => (
              <Col
                xs={24}
                sm={12}
                md={8}
                lg={6}
                key={user._id}
                ref={allFriends.length === index + 1 ? lastElementRef : null}
              >
                <UserCard
                  user={user}
                  status='friend'
                  // Perubahan: Gunakan handler lokal
                  onRemove={() => handleRemoveLocal(user._id)}
                />
              </Col>
            ))
          : !isFetching && (
              <Col span={24}>
                <Empty description="You haven't added any friends yet." />
              </Col>
            )}
      </Row>
      {isFetching && page > 1 && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Spin />
        </div>
      )}
      <Divider />
    </>
  );
};

export default MyFriends;
