import React, { useState, useEffect, useRef, useCallback } from "react";
import { Row, Col, Typography, Spin, Empty, Divider, message } from "antd"; // Tambah message
import UserCard from "./UserCard";
import {
  useGetFriendRequestsQuery,
  useAcceptFriendMutation,
  useRejectFriendMutation,
} from "../../service/friends/ApiFriend";
import { useSocket } from "../../context/SocketContext";

const { Title } = Typography;

const Requests = () => {
  const socket = useSocket();
  const [page, setPage] = useState(1);
  const [allRequests, setAllRequests] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  // Hook mutasi dari RTK Query
  const [acceptFriend] = useAcceptFriendMutation();
  const [rejectFriend] = useRejectFriendMutation();

  const {
    data: requestsData,
    isLoading,
    isFetching,
    refetch,
  } = useGetFriendRequestsQuery({
    page: page,
    limit: 8,
  });

  // --- LOGIKA BARU: Optimistic UI Updates ---
  // Fungsi ini menangani logika tampilan + server untuk Accept
  const handleAcceptLocal = async (userId) => {
    // 1. Update UI Instan: Hapus user dari list state lokal
    setAllRequests((prev) => prev.filter((user) => user._id !== userId));

    try {
      // 2. Kirim request ke server
      await acceptFriend(userId).unwrap();
      message.success("Friend request accepted!");
    } catch (error) {
      // 3. Jika gagal, beri pesan error dan refetch untuk mengembalikan data
      console.error("Failed to accept:", error);
      message.error("Failed to accept friend request.");
      refetch();
    }
  };

  // Fungsi ini menangani logika tampilan + server untuk Reject
  const handleRejectLocal = async (userId) => {
    // 1. Update UI Instan: Hapus user dari list
    setAllRequests((prev) => prev.filter((user) => user._id !== userId));

    try {
      // 2. Kirim request ke server
      await rejectFriend(userId).unwrap();
      message.info("Friend request declined.");
    } catch (error) {
      // 3. Jika gagal, refetch
      console.error("Failed to reject:", error);
      message.error("Failed to decline request.");
      refetch();
    }
  };
  // ------------------------------------------

  // Efek untuk mengakumulasi data paginasi
  useEffect(() => {
    if (requestsData?.hasMore !== undefined) {
      setHasMore(requestsData.hasMore);
    }
    const newRequests = requestsData?.friendRequests || [];
    if (newRequests.length > 0) {
      if (page === 1) {
        setAllRequests(newRequests);
      } else {
        setAllRequests((prev) => {
          const existingIds = new Set(prev.map((u) => u._id));
          const newUsersToAdd = newRequests.filter(
            (u) => !existingIds.has(u._id)
          );
          return [...prev, ...newUsersToAdd];
        });
      }
    } else if (page === 1) {
      setAllRequests([]);
    }
  }, [requestsData, page]);

  // Efek untuk socket listener (Real-time notifikasi masuk)
  useEffect(() => {
    if (socket) {
      const handleNotification = () => {
        // Jika ada notifikasi baru, reset ke halaman 1 dan ambil data terbaru
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
        Friend Requests
      </Title>
      <Row gutter={[16, 16]}>
        {allRequests.length > 0
          ? allRequests.map((user, index) => (
              <Col
                xs={24}
                sm={12}
                md={8}
                lg={6}
                key={user._id}
                ref={allRequests.length === index + 1 ? lastElementRef : null}
              >
                <UserCard
                  user={user}
                  status='received'
                  // Perubahan: Gunakan handler lokal, bukan langsung mutasi
                  onAccept={() => handleAcceptLocal(user._id)}
                  onReject={() => handleRejectLocal(user._id)}
                />
              </Col>
            ))
          : !isFetching && (
              <Col span={24}>
                <Empty description='No new friend requests.' />
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

export default Requests;
