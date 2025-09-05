import { useEffect, useState } from "react";
import * as Lia from "react-icons/lia";
import * as Fa from "react-icons/fa";
import {
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
} from "../../services/api/notification/NotificationApi";
import { formatDistanceToNow } from "date-fns";
import "./notif.scss";

const Notif = () => {
  const getNotificationIcon = (type) => {
    switch (type) {
      case "friend_request":
        return <Lia.LiaUserFriendsSolid />;
      case "friend_accepted":
        return <Fa.FaCheck />;
      case "post_like":
        return <Fa.FaHeart />;
      case "post_comment":
        return <Fa.FaComment />;
      case "comment_like":
        return <Fa.FaThumbsUp />;
      case "story_view":
        return <Fa.FaEye />;
      case "message":
        return <Fa.FaEnvelope />;
      case "mention":
        return <Fa.FaBullhorn />;
      case "tag":
        return <Fa.FaTag />;
      default:
        return <Fa.FaBell />;
    }
  };

  const formatTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "recently";
    }
  };

  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications
  const {
    data: notificationsData,
    isLoading,
    error,
  } = useGetNotificationsQuery({
    page: 1,
    limit: 10,
  });

  // Mutations
  const [markAsRead, { isError, error: markAsReadError }] =
    useMarkAsReadMutation();
  const [
    markAllAsRead,
    { isError: isMarkAllAsReadError, error: markAllAsReadError },
  ] = useMarkAllAsReadMutation();

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  const handleMarkAsRead = (notificationId) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  useEffect(() => {
    if (isError || isMarkAllAsReadError) {
      toast.error(markAsReadError || markAllAsReadError);
    }
  }, [isError, isMarkAllAsReadError, markAsReadError, markAllAsReadError]);

  if (isLoading) {
    return (
      <div className='notif'>
        <h3>Notifications</h3>
        <div className='notification-list'>
          <div className='notification-item loading'>
            <div className='loading-skeleton'></div>
            <div className='loading-skeleton small'></div>
          </div>
          <div className='notification-item loading'>
            <div className='loading-skeleton'></div>
            <div className='loading-skeleton small'></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='notif'>
        <h3>Notifications</h3>
        <div className='notification-list'>
          <div className='notification-item error'>
            <p>Failed to load notifications</p>
            <small>Please try again later</small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='notif'>
      <div className='notif-header'>
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <button className='mark-all-read-btn' onClick={handleMarkAllAsRead}>
            Mark all as read
          </button>
        )}
      </div>

      <div className='notification-list'>
        {notifications.length === 0 ? (
          <div className='notification-item empty'>
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
              onClick={() =>
                !notification.isRead && handleMarkAsRead(notification._id)
              }
            >
              <div className='notification-content'>
                {notification.image && (
                  <div className='notification-image'>
                    <img src={notification.image} alt='notification' />
                  </div>
                )}
                <div className='notification-text'>
                  <div className='notification-title-row'>
                    <span className='notification-icon'>
                      {getNotificationIcon(notification.type)}
                    </span>
                    <p className='notification-title'>{notification.title}</p>
                  </div>
                  <p className='notification-body'>{notification.body}</p>
                  <small className='notification-time'>
                    {formatTime(notification.createdAt)}
                  </small>
                </div>
                {!notification.isRead && (
                  <div className='unread-indicator'></div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notif;
