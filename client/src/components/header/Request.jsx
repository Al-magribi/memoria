import * as Io from "react-icons/io5";
import "./request.scss";

const Request = () => {
  return (
    <div className='request'>
      <h3>Friend Requests</h3>
      <div className='request-list'>
        <div className='request-item'>
          <div className='user-info'>
            <img src='https://i.pravatar.cc/150?img=1' alt='User' />
            <div className='user-details'>
              <p className='name'>Sarah Johnson</p>
              <p className='mutual'>5 mutual friends</p>
            </div>

            <div className='request-actions'>
              <button className='accept-btn'>
                <Io.IoPersonAdd />
              </button>
              <button className='reject-btn'>
                <Io.IoPersonRemove />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Request;
