import { useGetFriendshipSuggestionsQuery } from "../../services/api/friendship/FriendshipApi";
import FriendButton from "../friendbutton/FriendButton";

const Suggestions = () => {
  // Get friendship suggestions from API
  const {
    data: suggestionsData,
    isLoading,
    error,
  } = useGetFriendshipSuggestionsQuery();

  const suggestions = suggestionsData?.suggestions || [];

  if (isLoading) {
    return (
      <div className='suggestions'>
        <h3 className='suggestions-title'>People you might know</h3>
        <div className='suggestions-list'>
          <div className='loading-suggestions'>
            <div className='loading-spinner'></div>
            <p>Loading suggestions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='suggestions'>
        <h3 className='suggestions-title'>People you might know</h3>
        <div className='suggestions-list'>
          <div className='error-suggestions'>
            <p>Failed to load suggestions</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='suggestions'>
      <h3 className='suggestions-title'>People you might know</h3>
      <div className='suggestions-list'>
        {suggestions.length > 0 ? (
          suggestions.map((suggestion) => (
            <div className='suggestion-item' key={suggestion.id}>
              <div className='suggestion-content'>
                <div className='suggestion-avatar'>
                  <img
                    src={suggestion.profilePicture}
                    alt={`${suggestion.firstName} ${suggestion.lastName}'s avatar`}
                    onClick={() =>
                      (window.location.href = `/user/${suggestion.id}`)
                    }
                    style={{ cursor: "pointer" }}
                    loading='lazy'
                  />
                </div>
                <div className='suggestion-info'>
                  <h4
                    className='suggestion-name'
                    onClick={() =>
                      (window.location.href = `/user/${suggestion.id}`)
                    }
                    style={{ cursor: "pointer" }}
                  >
                    {suggestion.firstName} {suggestion.lastName}
                  </h4>
                  <p className='suggestion-mutual'>
                    {suggestion.mutualFriendsCount} mutual friends
                  </p>
                </div>
              </div>
              <div className='suggestion-actions'>
                <FriendButton
                  userId={suggestion.id}
                  className='suggestion-friend-btn'
                />
              </div>
            </div>
          ))
        ) : (
          <div className='no-suggestions'>
            <p>No suggestions available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Suggestions;
