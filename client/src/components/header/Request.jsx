import * as Io from "react-icons/io5";
import {
  useGetFriendRequestsQuery,
  useAcceptFriendRequestMutation,
  useRejectFriendRequestMutation,
} from "../../services/api/friendship/FriendshipApi";
import "./request.scss";

const Request = () => {
  const { data: friendRequestsData, isLoading } = useGetFriendRequestsQuery();
  const [acceptFriendRequest] = useAcceptFriendRequestMutation();
  const [rejectFriendRequest] = useRejectFriendRequestMutation();

  const friendRequests = friendRequestsData?.requests || [];

  const handleAccept = async (friendshipId) => {
    try {
      await acceptFriendRequest(friendshipId);
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleReject = async (friendshipId) => {
    try {
      await rejectFriendRequest(friendshipId);
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  if (isLoading) {
    return (
      <div className='request'>
        <h3>Friend Requests</h3>
        <div className='request-list'>
          <div style={{ textAlign: "center", padding: "1rem" }}>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className='request'>
      <h3>Friend Requests ({friendRequests.length})</h3>
      <div className='request-list'>
        {friendRequests.length > 0 ? (
          friendRequests.map((request) => (
            <div key={request.id} className='request-item'>
              <div className='user-info'>
                <div className='user-details'>
                  <img
                    src={
                      request.requester.profilePicture ||
                      "https://i.pravatar.cc/150?img=1"
                    }
                    alt={`${request.requester.firstName} ${request.requester.lastName}`}
                    onClick={() =>
                      (window.location.href = `/user/${request.requester.id}`)
                    }
                    style={{ cursor: "pointer" }}
                  />

                  <div>
                    <p
                      className='name'
                      onClick={() =>
                        (window.location.href = `/user/${request.requester.id}`)
                      }
                      style={{ cursor: "pointer" }}
                    >
                      {request.requester.firstName} {request.requester.lastName}
                    </p>
                    <p className='mutual'>
                      {request.mutualFriendsCount} mutual friends
                    </p>
                  </div>
                </div>

                <div className='request-actions'>
                  <button
                    className='accept-btn'
                    onClick={() => handleAccept(request.id)}
                    title='Accept friend request'
                  >
                    <Io.IoPersonAdd />
                  </button>
                  <button
                    className='reject-btn'
                    onClick={() => handleReject(request.id)}
                    title='Reject friend request'
                  >
                    <Io.IoPersonRemove />
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{ textAlign: "center", padding: "1rem", color: "#65676b" }}
          >
            No friend requests
          </div>
        )}
      </div>
    </div>
  );
};

export default Request;
