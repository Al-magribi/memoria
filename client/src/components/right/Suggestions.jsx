import * as Io from "react-icons/io5";

const Suggestions = () => {
  const suggestions = [
    {
      id: 1,
      name: "John Doe",
      profilePicture:
        "https://images.pexels.com/photos/2744193/pexels-photo-2744193.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      mutualFriends: 100,
    },
    {
      id: 2,
      name: "Jane Doe",
      profilePicture:
        "https://images.pexels.com/photos/2104252/pexels-photo-2104252.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      mutualFriends: 85,
    },
    {
      id: 3,
      name: "Jim Beam",
      profilePicture:
        "https://images.pexels.com/photos/906052/pexels-photo-906052.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      mutualFriends: 120,
    },
  ];

  return (
    <div className='suggestions'>
      <h3 className='suggestions-title'>People you might know</h3>
      <div className='suggestions-list'>
        {suggestions?.map((suggestion) => (
          <div className='suggestion-item' key={suggestion.id}>
            <div className='suggestion-content'>
              <div className='suggestion-avatar'>
                <img
                  src={suggestion.profilePicture}
                  alt={`${suggestion.name}'s avatar`}
                />
              </div>
              <div className='suggestion-info'>
                <h4 className='suggestion-name'>{suggestion.name}</h4>
                <p className='suggestion-mutual'>
                  {suggestion.mutualFriends} mutual friends
                </p>
              </div>
            </div>
            <div className='suggestion-actions'>
              <button className='btn-add'>
                <Io.IoPersonAdd />
              </button>
              <button className='btn-remove'>
                <Io.IoPersonRemove />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Suggestions;
