import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  Input,
  Row,
  Col,
  Typography,
  Empty,
  Divider,
  Spin,
  Button,
} from "antd";
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
import { useEffect } from "react";
import { useSelector } from "react-redux";
import io from "socket.io-client";
import { useSocket } from "../../context/SocketContext";

const { Title, Text } = Typography;
const { Search } = Input;

const Friends = () => {
  const socket = useSocket();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.user);
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(1);
  const [friendRequestsLimit, setFriendRequestsLimit] = useState(8);
  const [myFriendsLimit, setMyFriendsLimit] = useState(8);

  const {
    data: usersData,
    isLoading: isLoadingUsers,
    isFetching: isFetchingUsers,
    refetch: refetchUsers,
  } = useGetUsersQuery({ page });
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

  const [addFriend] = useAddFriendMutation();
  const [acceptFriend] = useAcceptFriendMutation();
  const [rejectFriend] = useRejectFriendMutation();
  const [cancelRequest] = useCancelRequestMutation();
  const [removeFriend] = useRemoveFriendMutation();

  const friendRequests = friendRequestsData?.friendRequests || [];
  const myFriends = myFriendsData?.friends || [];

  const processedUsers = useMemo(() => {
    if (!usersData?.users) return [];

    const myFriendIds = new Set(myFriends.map((f) => f._id));
    const friendRequestIds = new Set(friendRequests.map((r) => r._id));
    const sentRequestIds = new Set(usersData?.sentRequests);

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

  const peopleYouMayKnow = processedUsers.filter(
    (u) => u.status === "add" || u.status === "sent"
  );

  useEffect(() => {
    // 1. Periksa 'socket'
    if (socket) {
      const handleNotification = async () => {
        try {
          console.log(
            "Socket notification received. Refetching friends data..."
          );
          await refetchMyFriends();
          await refetchFriendRequests();
          await refetchUsers();
          console.log("Refetching complete.");
        } catch (err) {
          console.error("Gagal me-refetch data via socket:", err);
        }
      };

      socket.on("notification", handleNotification);

      // 2. Cleanup HANYA 'listener'
      return () => {
        socket.off("notification", handleNotification);
      };
    }
    // 3. Ubah 'user' menjadi 'socket' di dependensi
  }, [socket, refetchFriendRequests, refetchUsers, refetchMyFriends]);

  const filteredUsers = useMemo(() => {
    if (!searchTerm) {
      return peopleYouMayKnow;
    }
    const lowerCaseSearch = searchTerm.toLowerCase();
    return peopleYouMayKnow.filter(
      (user) =>
        user.firstName.toLowerCase().includes(lowerCaseSearch) ||
        user.lastName.toLowerCase().includes(lowerCaseSearch) ||
        user.username.toLowerCase().includes(lowerCaseSearch)
    );
  }, [searchTerm, peopleYouMayKnow]);

  const handleLayoutTabChange = (key) => {
    localStorage.setItem("activeTab", key);
    navigate("/");
  };

  const renderUserList = (
    list,
    title,
    noDataText,
    limit,
    onLoadMore,
    hasMore
  ) => (
    <>
      <Title level={4} style={{ marginTop: 24 }}>
        {title}
      </Title>
      <Row gutter={[16, 16]}>
        {list.slice(0, limit).length > 0 ? (
          list.slice(0, limit).map((user) => (
            <Col xs={24} sm={12} md={8} lg={6} key={user._id}>
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
            <Text type='secondary'>{noDataText}</Text>
          </Col>
        )}
      </Row>
      {hasMore && (
        <div style={{ textAlign: "center", marginTop: 16 }}>
          <Button onClick={onLoadMore}>Load More</Button>
        </div>
      )}
    </>
  );

  if (isLoadingUsers || isLoadingMyFriends || isLoadingFriendRequests) {
    return (
      <MainLayout activeTab={"friends"} onTabChange={handleLayoutTabChange}>
        <Spin
          size='large'
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

  return (
    <MainLayout activeTab={"friends"} onTabChange={handleLayoutTabChange}>
      <Card style={{ width: "100%" }}>
        <Title level={3} style={{ marginTop: 0 }}>
          Friends
        </Title>
        <Text type='secondary' style={{ display: "block", marginBottom: 16 }}>
          Connect with people in Memoria
        </Text>

        {renderUserList(
          friendRequests.map((u) => ({ ...u, status: "received" })),
          "Friend Requests",
          "No new friend requests.",
          friendRequestsLimit,
          () => setFriendRequestsLimit((prev) => prev + 8),
          friendRequests.length > friendRequestsLimit
        )}

        <Divider />

        <Title level={4}>People You May Know</Title>
        <Search
          placeholder='Search for name or username'
          onChange={(e) => setSearchTerm(e.target.value)}
          enterButton={<SearchOutlined />}
          size='large'
          style={{ marginBottom: 24 }}
        />
        <Row gutter={[16, 16]}>
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <Col xs={24} sm={12} md={8} lg={6} key={user._id}>
                <UserCard
                  user={user}
                  status={user.status}
                  onAdd={() => addFriend(user._id)}
                  onCancel={() => cancelRequest(user._id)}
                />
              </Col>
            ))
          ) : (
            <Col span={24}>
              <Empty
                description={
                  <Text type='secondary'>
                    User not found for "<strong>{searchTerm}</strong>"
                  </Text>
                }
              />
            </Col>
          )}
        </Row>
        {usersData?.hasMore && !searchTerm && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Button
              onClick={() => setPage((prev) => prev + 1)}
              loading={isFetchingUsers}
            >
              Load More
            </Button>
          </div>
        )}

        <Divider />

        {renderUserList(
          myFriends.map((u) => ({ ...u, status: "friend" })),
          "Your Friends",
          "You haven't added any friends yet.",
          myFriendsLimit,
          () => setMyFriendsLimit((prev) => prev + 8),
          myFriends.length > myFriendsLimit
        )}
      </Card>
    </MainLayout>
  );
};

export default Friends;
