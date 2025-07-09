import React, { useState } from "react";
import {
  useGetFriendshipStatusQuery,
  useSendFriendRequestMutation,
} from "../../services/api/friendship/FriendshipApi";
import {
  FaUserPlus,
  FaUserCheck,
  FaUserTimes,
  FaSpinner,
} from "react-icons/fa";
import "./friendButton.scss";

const FriendButton = ({ userId, className = "" }) => {
  const [isLoading, setIsLoading] = useState(false);

  const { data: friendshipStatus, isLoading: isLoadingStatus } =
    useGetFriendshipStatusQuery(userId);
  const [sendFriendRequest] = useSendFriendRequestMutation();

  const handleSendRequest = async () => {
    if (!userId) return;

    setIsLoading(true);
    try {
      await sendFriendRequest(userId);
    } catch (error) {
      console.error("Error sending friend request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingStatus) {
    return (
      <button className={`friend-button loading ${className}`} disabled>
        <FaSpinner className='spinner' />
        Loading...
      </button>
    );
  }

  const { status, canSendRequest } = friendshipStatus || {};

  switch (status) {
    case "accepted":
      return (
        <button className={`friend-button friends ${className}`} disabled>
          <FaUserCheck />
          Friends
        </button>
      );

    case "pending":
      return (
        <button className={`friend-button pending ${className}`} disabled>
          <FaUserTimes />
          Request Sent
        </button>
      );

    case "rejected":
    case "blocked":
      return (
        <button className={`friend-button blocked ${className}`} disabled>
          <FaUserTimes />
          {status === "blocked" ? "Blocked" : "Request Rejected"}
        </button>
      );

    case "none":
    default:
      return (
        <button
          className={`friend-button add ${className}`}
          onClick={handleSendRequest}
          disabled={isLoading || !canSendRequest}
        >
          {isLoading ? (
            <>
              <FaSpinner className='spinner' />
              Sending...
            </>
          ) : (
            <>
              <FaUserPlus />
              Add
            </>
          )}
        </button>
      );
  }
};

export default FriendButton;
