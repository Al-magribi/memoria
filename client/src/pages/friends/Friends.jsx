import React, {
  useState,
  useMemo,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";
import { Card, Input, Row, Col, Typography, Empty, Divider, Spin } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import MainLayout from "../../components/layout/MainLayout";
import UserCard from "./UserCard";
import {
  useGetUsersQuery,
  useGetMyFriendsQuery,
  useGetFriendRequestsQuery,
  useAddFriendMutation,
  useAcceptFriendMutation,
  useRejectFriendMutation,
  useCancelRequestMutation,
  useRemoveFriendMutation,
} from "../../service/friends/ApiFriend";
import { useSelector } from "react-redux";
import { useSocket } from "../../context/SocketContext";

const { Title, Text } = Typography;
const { Search } = Input;

/**
 * Hook kustom untuk menunda (debounce) sebuah nilai.
 * Ini mencegah pemanggilan API pada setiap ketukan tombol.
 * @param {any} value Nilai yang akan di-debounce
 * @param {number} delay Waktu tunda dalam milidetik
 * @returns {any} Nilai yang telah di-debounce
 */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    // Set timeout baru untuk memperbarui nilai setelah 'delay'
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Bersihkan timeout sebelumnya jika 'value' atau 'delay' berubah
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

const Friends = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);

  // --- State untuk Pencarian & Debouncing ---
  const [searchTerm, setSearchTerm] = useState(""); // Input pengguna langsung
  const debouncedSearchTerm = useDebounce(searchTerm, 500); // Tunda 500ms

  // --- State untuk Paginasi ---

  // 1. People You May Know (Server-side)
  const [page, setPage] = useState(1); // Halaman saat ini
  const [allProcessedUsers, setAllProcessedUsers] = useState([]); // Akumulasi pengguna
  const [hasMoreUsers, setHasMoreUsers] = useState(true); // Status dari server

  // 2. Friend Requests (Client-side)
  const [friendRequestsLimit, setFriendRequestsLimit] = useState(8); // Mulai dengan 8

  // 3. My Friends (Client-side)
  const [myFriendsLimit, setMyFriendsLimit] = useState(8); // Mulai dengan 8

  // --- Hook RTK Query ---

  // Panggil 'useGetUsersQuery' dengan 'page' dan 'debouncedSearchTerm'
  const {
    data: usersData, // Ini adalah data PER HALAMAN
    isLoading: isLoadingUsers, // Loading awal (hanya sekali)
    isFetching: isFetchingUsers, // Loading setiap kali query berjalan (termasuk paginasi)
  } = useGetUsersQuery({
    page,
    search: debouncedSearchTerm,
  });

  const {
    data: myFriendsData,
    isLoading: isLoadingMyFriends,
    refetch: refetchMyFriends,
  } = useGetMyFriendsQuery();

  const {
    data: friendRequestsData,
    isLoading: isLoadingFriendRequests,
    refetch: refetchFriendRequests,
  } = useGetFriendRequestsQuery();

  // --- Mutasi RTK Query ---
  const [addFriend] = useAddFriendMutation();
  const [acceptFriend] = useAcceptFriendMutation();
  const [rejectFriend] = useRejectFriendMutation();
  const [cancelRequest] = useCancelRequestMutation();
  const [removeFriend] = useRemoveFriendMutation();

  // --- Ekstraksi Data ---
  const friendRequests = friendRequestsData?.friendRequests || [];
  const myFriends = myFriendsData?.friends || [];

  // 1. MEMO: Proses data 'halaman baru' yang datang dari useGetUsersQuery
  const newProcessedUsers = useMemo(() => {
    if (!usersData?.users) return [];

    const myFriendIds = new Set(myFriends.map((f) => f._id));
    const friendRequestIds = new Set(friendRequests.map((r) => r._id));
    const sentRequestIds = new Set(usersData?.sentRequests || []);

    return usersData.users.map((user) => {
      const isFriend = myFriendIds.has(user._id);
      const hasSentRequest = sentRequestIds.has(user._id);
      const hasReceivedRequest = friendRequestIds.has(user._id);

      let status = "add";
      if (isFriend) status = "friend";
      else if (hasSentRequest) status = "sent";
      else if (hasReceivedRequest) status = "received";

      return { ...user, status };
    });
  }, [usersData, myFriends, friendRequests]);

  // 2. EFFECT: Reset 'page' ke 1 jika 'debouncedSearchTerm' berubah
  useEffect(() => {
    setPage(1); // Ini akan memicu query baru untuk halaman 1
  }, [debouncedSearchTerm]);

  // 3. EFFECT: Akumulasi 'newProcessedUsers' ke 'allProcessedUsers'
  useEffect(() => {
    // Update status 'hasMore' dari fetch terbaru
    if (usersData?.hasMore !== undefined) {
      setHasMoreUsers(usersData.hasMore);
    }

    if (newProcessedUsers.length > 0) {
      if (page === 1) {
        // Jika ini halaman 1 (reset dari pencarian atau load awal)
        setAllProcessedUsers(newProcessedUsers); // GANTI total list
      } else {
        // Jika halaman > 1, tambahkan ke list
        setAllProcessedUsers((prevUsers) => {
          const existingIds = new Set(prevUsers.map((u) => u._id));
          const newUsersToAdd = newProcessedUsers.filter(
            (u) => !existingIds.has(u._id)
          );
          return [...prevUsers, ...newUsersToAdd];
        });
      }
    } else if (page === 1) {
      // Jika halaman 1 dan tidak ada hasil (misal pencarian kosong)
      setAllProcessedUsers([]);
    }
  }, [newProcessedUsers, page, usersData?.hasMore]); // Dijalankan saat data baru tiba

  // 4. MEMO: Buat daftar 'People You May Know' dari 'allProcessedUsers'
  const peopleYouMayKnow = useMemo(
    () =>
      allProcessedUsers.filter(
        (u) => u.status === "add" || u.status === "sent"
      ),
    [allProcessedUsers]
  );

  // 5. EFFECT: Socket listener
  useEffect(() => {
    if (socket) {
      const handleNotification = async () => {
        try {
          console.log("Socket notification received. Refetching data...");
          // Refetch data yang full (friends dan requests)
          await refetchMyFriends();
          await refetchFriendRequests();

          // Reset 'People You May Know' ke halaman 1
          setPage(1);

          console.log("Refetching complete.");
        } catch (err) {
          console.error("Gagal me-refetch data via socket:", err);
        }
      };

      socket.on("notification", handleNotification);

      return () => {
        socket.off("notification", handleNotification);
      };
    }
  }, [socket, refetchFriendRequests, refetchMyFriends]);

  // --- Logika Intersection Observer (Infinite Scroll) ---

  // Observer untuk "People You May Know" (server-side)
  const pykmObserver = useRef();
  const lastPYKMElementRef = useCallback(
    (node) => {
      if (isFetchingUsers) return; // Jangan fetch jika sedang fetching
      if (pykmObserver.current) pykmObserver.current.disconnect();
      pykmObserver.current = new IntersectionObserver((entries) => {
        // Jika elemen terakhir terlihat DAN ada lebih banyak data
        if (entries[0].isIntersecting && hasMoreUsers) {
          setPage((prevPage) => prevPage + 1); // Muat halaman berikutnya
        }
      });
      if (node) pykmObserver.current.observe(node);
    },
    [isFetchingUsers, hasMoreUsers] // Hanya bergantung pada status fetching & 'hasMore'
  );

  // Observer untuk "Friend Requests" (client-side)
  const frObserver = useRef();
  const lastFRElementRef = useCallback(
    (node) => {
      if (frObserver.current) frObserver.current.disconnect();
      frObserver.current = new IntersectionObserver((entries) => {
        if (
          entries[0].isIntersecting &&
          friendRequests.length > friendRequestsLimit
        ) {
          setFriendRequestsLimit((prev) => prev + 8); // Tampilkan 8 lagi
        }
      });
      if (node) frObserver.current.observe(node);
    },
    [friendRequests.length, friendRequestsLimit]
  );

  // Observer untuk "My Friends" (client-side)
  const mfObserver = useRef();
  const lastMFElementRef = useCallback(
    (node) => {
      if (mfObserver.current) mfObserver.current.disconnect();
      mfObserver.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && myFriends.length > myFriendsLimit) {
          setMyFriendsLimit((prev) => prev + 8); // Tampilkan 8 lagi
        }
      });
      if (node) mfObserver.current.observe(node);
    },
    [myFriends.length, myFriendsLimit]
  );

  // --- Handler dan Fungsi Render ---

  const handleLayoutTabChange = (key) => {
    localStorage.setItem("activeTab", key);
    navigate("/");
  };

  /**
   * Fungsi helper untuk me-render daftar pengguna dengan infinite scroll
   */
  const renderUserList = (
    list,
    title,
    noDataText,
    limit,
    lastElementRef // Prop untuk observer
  ) => {
    const slicedList = list.slice(0, limit); // Data yang akan ditampilkan

    return (
      <>
        <Title level={4} style={{ marginTop: 24 }}>
          {title}
        </Title>
        <Row gutter={[16, 16]}>
          {slicedList.length > 0 ? (
            slicedList.map((user, index) => (
              <Col
                xs={24}
                sm={12}
                md={8}
                lg={6}
                key={user._id}
                // Pasang 'ref' ke elemen terakhir dalam daftar yang di-slice
                ref={slicedList.length === index + 1 ? lastElementRef : null}
              >
                <UserCard
                  user={user}
                  status={user.status}
                  onAdd={() => addFriend(user._id)}
                  onAccept={() => acceptFriend(user._id)}
                  onReject={() => rejectFriend(user._id)}
                  onCancel={() => cancelRequest(user._id)}
                  onRemove={() => removeFriend(user._id)}
                />
              </Col>
            ))
          ) : (
            <Col span={24}>
              <Text type="secondary">{noDataText}</Text>
            </Col>
          )}
        </Row>
        {/* Tombol "Load More" dihapus */}
      </>
    );
  };

  // Tampilkan Spinner besar jika salah satu query awal sedang loading
  if (isLoadingUsers || isLoadingMyFriends || isLoadingFriendRequests) {
    return (
      <MainLayout activeTab={"friends"} onTabChange={handleLayoutTabChange}>
        <Spin
          size="large"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          }}
        />
      </MainLayout>
    );
  }

  // --- Render Komponen Utama ---
  return (
    <MainLayout activeTab={"friends"} onTabChange={handleLayoutTabChange}>
      <Card style={{ width: "100%" }}>
        <Title level={3} style={{ marginTop: 0 }}>
          Friends
        </Title>
        <Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
          Connect with people in Memoria
        </Text>

        {/* --- Bagian Friend Requests --- */}
        {renderUserList(
          friendRequests.map((u) => ({ ...u, status: "received" })),
          "Friend Requests",
          "No new friend requests.",
          friendRequestsLimit,
          lastFRElementRef // Kirim observer ref
        )}

        <Divider />

        {/* --- Bagian Your Friends --- */}
        {renderUserList(
          myFriends.map((u) => ({ ...u, status: "friend" })),
          "Your Friends",
          "You haven't added any friends yet.",
          myFriendsLimit,
          lastMFElementRef // Kirim observer ref
        )}

        <Divider />

        {/* --- Bagian People You May Know --- */}
        <Title level={4}>People You May Know</Title>
        <Search
          placeholder="Search for name or username"
          // 'onChange' hanya mengubah 'searchTerm' (state cepat)
          onChange={(e) => setSearchTerm(e.target.value)}
          // 'loading' saat 'isFetchingUsers' (setiap kali query berjalan)
          loading={isFetchingUsers}
          enterButton={<SearchOutlined />}
          size="large"
          style={{ marginBottom: 24 }}
        />
        <Row gutter={[16, 16]}>
          {/* Render 'peopleYouMayKnow' (bukan 'filteredUsers') */}
          {peopleYouMayKnow.length > 0
            ? peopleYouMayKnow.map((user, index) => (
                <Col
                  xs={24}
                  sm={12}
                  md={8}
                  lg={6}
                  key={user._id}
                  // Pasang 'ref' ke elemen terakhir
                  ref={
                    peopleYouMayKnow.length === index + 1
                      ? lastPYKMElementRef
                      : null
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
            : // Jangan tampilkan 'Empty' jika sedang loading halaman pertama
              // (isFetchingUsers akan true tapi isLoadingUsers akan false)
              !isFetchingUsers && (
                <Col span={24}>
                  <Empty
                    description={
                      // Cek 'debounced' term untuk deskripsi
                      debouncedSearchTerm ? (
                        <Text type="secondary">
                          User not found for "
                          <strong>{debouncedSearchTerm}</strong>"
                        </Text>
                      ) : (
                        <Text type="secondary">No users to show.</Text>
                      )
                    }
                  />
                </Col>
              )}
        </Row>

        {/* Tampilkan 'Spinner' di bawah JIKA sedang fetching DAN BUKAN loading awal */}
        {isFetchingUsers && page > 1 && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Spin size="large" />
          </div>
        )}

        <Divider />
      </Card>
    </MainLayout>
  );
};

export default Friends;
