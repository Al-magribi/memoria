import "./notif.scss";

const Notif = () => {
  return (
    <div className="notif">
      <h3>Notifications</h3>
      <div className="notification-list">
        <div className="notification-item">
          <p>New project invitation from John Doe</p>
          <small>2 minutes ago</small>
        </div>
        <div className="notification-item">
          <p>Your project "Website Redesign" was updated</p>
          <small>1 hour ago</small>
        </div>
        <div className="notification-item">
          <p>New comment on your post</p>
          <small>3 hours ago</small>
        </div>
      </div>
    </div>
  );
};

export default Notif;
