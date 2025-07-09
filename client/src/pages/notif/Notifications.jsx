import { useGetNotificationsQuery } from "../../services/api/notification/NotificationApi";
import { formatDistanceToNow } from "date-fns";
import "./notifications.scss";

const Notifications = () => {
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch,
  } = useGetNotificationsQuery({
    page: 1,
    limit: 50,
  });

  const notifications = notificationsData?.notifications || [];

  const createTestNotifications = async () => {
    try {
      const response = await fetch("/api/notifications/test", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Created ${result.count} test notifications!`);
        refetch(); // Refresh the notifications
      } else {
        alert("Failed to create test notifications");
      }
    } catch (error) {
      console.error("Error creating test notifications:", error);
      alert("Error creating test notifications");
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "friend_request":
        return "👥";
      case "friend_accepted":
        return "✅";
      case "post_like":
        return "❤️";
      case "post_comment":
        return "💬";
      case "comment_like":
        return "👍";
      case "story_view":
        return "👁️";
      case "message":
        return "💌";
      case "mention":
        return "📢";
      case "tag":
        return "🏷️";
      default:
        return "🔔";
    }
  };

  const formatTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "recently";
    }
  };

  if (isLoading) {
    return (
      <div className='notifications'>
        <h2>Notifications</h2>
        <div className='loading'>Loading notifications...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='notifications'>
        <h2>Notifications</h2>
        <div className='error'>Failed to load notifications</div>
      </div>
    );
  }

  return (
    <div className='notifications'>
      <div className='notifications-header'>
        <h2>Notifications</h2>
        <button className='test-btn' onClick={createTestNotifications}>
          Create Test Notifications
        </button>
      </div>

      <div className='notifications-list'>
        {notifications.length === 0 ? (
          <div className='empty-state'>
            <p>No notifications yet</p>
            <small>You're all caught up!</small>
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-item ${
                !notification.isRead ? "unread" : ""
              }`}
            >
              <div className='notification-content'>
                <div className='notification-icon'>
                  {getNotificationIcon(notification.type)}
                </div>
                <div className='notification-text'>
                  <p className='notification-title'>{notification.title}</p>
                  <p className='notification-body'>{notification.body}</p>
                  <small className='notification-time'>
                    {formatTime(notification.createdAt)}
                  </small>
                </div>
                {!notification.isRead && (
                  <div className='unread-indicator'></div>
                )}
              </div>
              {notification.image && (
                <div className='notification-image'>
                  <img src={notification.image} alt='notification' />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
