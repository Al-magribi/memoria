// Strangers.jsx
import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import {
  Input,
  Row,
  Col,
  Typography,
  Empty,
  Spin,
  Divider,
  message,
} from "antd"; // Tambah message
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
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const [page, setPage] = useState(1);
  const [allProcessedUsers, setAllProcessedUsers] = useState([]);
  const [hasMore, setHasMore] = useState(true);

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

  // --- LOGIKA OPTIMISTIC UI UPDATE (Agar tombol berubah instan) ---
  const handleAddFriendLocal = async (userId) => {
    // 1. Ubah UI secara instan (Optimistic)
    setAllProcessedUsers((prev) =>
      prev.map((user) =>
        user._id === userId ? { ...user, status: "sent" } : user
      )
    );

    // 2. Kirim request ke server
    try {
      await addFriend(userId).unwrap();
      // Tidak perlu refetch/reload halaman, karena UI sudah update
    } catch (error) {
      // Jika gagal, kembalikan status (Rollback)
      setAllProcessedUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, status: "add" } : user
        )
      );
      message.error("Failed to add friend");
    }
  };

  const handleCancelRequestLocal = async (userId) => {
    // 1. Ubah UI secara instan
    setAllProcessedUsers((prev) =>
      prev.map((user) =>
        user._id === userId ? { ...user, status: "add" } : user
      )
    );

    try {
      await cancelRequest(userId).unwrap();
    } catch (error) {
      setAllProcessedUsers((prev) =>
        prev.map((user) =>
          user._id === userId ? { ...user, status: "sent" } : user
        )
      );
      message.error("Failed to cancel request");
    }
  };
  // ---------------------------------------------------------------

  const newProcessedUsers = useMemo(() => {
    if (!usersData?.users) return [];
    const sentRequestIds = new Set(usersData?.sentRequests || []);
    return usersData.users.map((user) => {
      const hasSentRequest = sentRequestIds.has(user._id);
      const status = hasSentRequest ? "sent" : "add";
      return { ...user, status };
    });
  }, [usersData]);

  useEffect(() => {
    setPage(1);
    setAllProcessedUsers([]);
  }, [debouncedSearchTerm]);

  // --- PERBAIKAN LOGIKA MERGE DATA (Mengupdate status data lama) ---
  useEffect(() => {
    if (usersData?.hasMore !== undefined) {
      setHasMore(usersData.hasMore);
    }
    const newUsers = newProcessedUsers;

    if (newUsers.length > 0) {
      if (page === 1) {
        setAllProcessedUsers(newUsers);
      } else {
        setAllProcessedUsers((prev) => {
          // Buat Map untuk data baru agar akses cepat
          const newUsersMap = new Map(newUsers.map((u) => [u._id, u]));

          // 1. Update user yang sudah ada di list (jika status berubah dari server)
          const updatedPrev = prev.map((user) =>
            newUsersMap.has(user._id) ? newUsersMap.get(user._id) : user
          );

          // 2. Filter user baru yang belum ada di list lama
          const existingIds = new Set(prev.map((u) => u._id));
          const purelyNewUsers = newUsers.filter(
            (u) => !existingIds.has(u._id)
          );

          return [...updatedPrev, ...purelyNewUsers];
        });
      }
    } else if (page === 1) {
      setAllProcessedUsers([]);
    }
  }, [newProcessedUsers, page, usersData?.hasMore]);
  // ---------------------------------------------------------------

  useEffect(() => {
    if (socket) {
      const handleNotification = (data) => {
        // Opsional: Cek tipe notifikasi agar tidak mereset scroll sembarangan
        if (
          data.type === "friend_request_accepted" ||
          data.action === "was_removed_as_friend"
        ) {
          // Logic update spesifik jika diperlukan, atau refetch background
          refetch();
        }
      };
      socket.on("notification", handleNotification);
      return () => {
        socket.off("notification", handleNotification);
      };
    }
  }, [socket, refetch]);

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
                  // GUNAKAN HANDLER LOKAL BARU
                  onAdd={() => handleAddFriendLocal(user._id)}
                  onCancel={() => handleCancelRequestLocal(user._id)}
                />
              </Col>
            ))
          : !isFetching && (
              <Col span={24}>
                <Empty
                  description={
                    debouncedSearchTerm ? "User not found" : "No users to show."
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
