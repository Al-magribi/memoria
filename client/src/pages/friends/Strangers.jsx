// PeopleMayKnowTab.jsx

import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { Input, Row, Col, Typography, Empty, Spin, Divider } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import UserCard from "./UserCard";
import {
  useGetUsersQuery,
  useAddFriendMutation,
  useCancelRequestMutation,
} from "../../service/friends/ApiFriend";
import { useSocket } from "../../context/SocketContext";

const { Title, Text } = Typography;
const { Search } = Input;

// Hook kustom untuk menunda (debounce) sebuah nilai.
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const Strangers = () => {
  const socket = useSocket();

  // --- State untuk Pencarian & Debouncing ---
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // --- State untuk Paginasi ---
  const [page, setPage] = useState(1);
  const [allProcessedUsers, setAllProcessedUsers] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  // --- Hook RTK Query ---
  const {
    data: usersData,
    isLoading,
    isFetching,
    refetch,
  } = useGetUsersQuery({
    page,
    search: debouncedSearchTerm,
  });

  const [addFriend] = useAddFriendMutation();
  const [cancelRequest] = useCancelRequestMutation();

  // MEMO: Proses data 'halaman baru' yang datang dari useGetUsersQuery
  const newProcessedUsers = useMemo(() => {
    if (!usersData?.users) return [];

    const sentRequestIds = new Set(usersData?.sentRequests || []);

    return usersData.users.map((user) => {
      const hasSentRequest = sentRequestIds.has(user._id);
      // Backend (dari perbaikan kita sebelumnya) sudah memfilter teman
      // dan permintaan yang diterima, jadi kita hanya perlu cek 'sent'
      const status = hasSentRequest ? "sent" : "add";
      return { ...user, status };
    });
  }, [usersData]);

  // EFFECT: Reset 'page' ke 1 jika 'debouncedSearchTerm' berubah
  useEffect(() => {
    setPage(1); // Ini akan memicu query baru untuk halaman 1
    setAllProcessedUsers([]); // Kosongkan list saat search
  }, [debouncedSearchTerm]);

  // EFFECT: Akumulasi 'newProcessedUsers' ke 'allProcessedUsers'
  useEffect(() => {
    if (usersData?.hasMore !== undefined) {
      setHasMore(usersData.hasMore);
    }
    const newUsers = newProcessedUsers; // Ambil dari memo
    if (newUsers.length > 0) {
      if (page === 1) {
        setAllProcessedUsers(newUsers);
      } else {
        setAllProcessedUsers((prevUsers) => {
          const existingIds = new Set(prevUsers.map((u) => u._id));
          const newUsersToAdd = newUsers.filter((u) => !existingIds.has(u._id));
          return [...prevUsers, ...newUsersToAdd];
        });
      }
    } else if (page === 1) {
      setAllProcessedUsers([]);
    }
  }, [newProcessedUsers, page, usersData?.hasMore]);

  // EFFECT: Socket listener
  useEffect(() => {
    if (socket) {
      const handleNotification = () => {
        // Reset ke halaman 1 dan refetch
        setPage(1);
        refetch();
      };
      socket.on("notification", handleNotification);
      return () => {
        socket.off("notification", handleNotification);
      };
    }
  }, [socket, refetch]);

  // Logika Intersection Observer (Infinite Scroll)
  const observer = useRef();
  const lastElementRef = useCallback(
    (node) => {
      if (isFetching) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
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
        People You May Know
      </Title>
      <Search
        placeholder='Search for name or username'
        onChange={(e) => setSearchTerm(e.target.value)}
        loading={isFetching && page === 1}
        enterButton={<SearchOutlined />}
        size='large'
        style={{ marginBottom: 24 }}
      />
      <Row gutter={[16, 16]}>
        {allProcessedUsers.length > 0
          ? allProcessedUsers.map((user, index) => (
              <Col
                xs={24}
                sm={12}
                md={8}
                lg={6}
                key={user._id}
                ref={
                  allProcessedUsers.length === index + 1 ? lastElementRef : null
                }
              >
                <UserCard
                  user={user}
                  status={user.status}
                  onAdd={() => addFriend(user._id)}
                  onCancel={() => cancelRequest(user._id)}
                />
              </Col>
            ))
          : !isFetching && (
              <Col span={24}>
                <Empty
                  description={
                    debouncedSearchTerm ? (
                      <Text type='secondary'>
                        User not found for "
                        <strong>{debouncedSearchTerm}</strong>"
                      </Text>
                    ) : (
                      <Text type='secondary'>No users to show.</Text>
                    )
                  }
                />
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

export default Strangers;
