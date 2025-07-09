import React, { useState } from "react";
import { FaSearch, FaUserPlus, FaSpinner } from "react-icons/fa";
import FriendButton from "../friendbutton/FriendButton";
import "./userSearch.scss";

const UserSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch(
        `/api/auth/search?q=${encodeURIComponent(searchQuery.trim())}`,
        {
          credentials: "include",
        }
      );

      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
      } else {
        console.error("Search failed");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching users:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (!e.target.value.trim()) {
      setSearchResults([]);
      setHasSearched(false);
    }
  };

  return (
    <div className='user-search'>
      <div className='search-header'>
        <h2>Find People</h2>
        <p>Search for people to connect with</p>
      </div>

      <form onSubmit={handleSearch} className='search-form'>
        <div className='search-input-container'>
          <FaSearch className='search-icon' />
          <input
            type='text'
            placeholder='Search by name or username...'
            value={searchQuery}
            onChange={handleInputChange}
            className='search-input'
          />
          <button
            type='submit'
            className='search-button'
            disabled={isSearching || !searchQuery.trim()}
          >
            {isSearching ? <FaSpinner className='spinner' /> : "Search"}
          </button>
        </div>
      </form>

      <div className='search-results'>
        {isSearching && (
          <div className='loading-results'>
            <FaSpinner className='spinner' />
            <span>Searching...</span>
          </div>
        )}

        {!isSearching && hasSearched && (
          <>
            {searchResults.length > 0 ? (
              <div className='results-list'>
                <h3>Search Results ({searchResults.length})</h3>
                {searchResults.map((user) => (
                  <div key={user._id} className='user-result'>
                    <div className='user-info'>
                      <img
                        src={
                          user.profilePicture ||
                          "https://via.placeholder.com/50"
                        }
                        alt={`${user.firstName} ${user.lastName}`}
                        className='user-avatar'
                        onClick={() =>
                          (window.location.href = `/user/${user._id}`)
                        }
                        style={{ cursor: "pointer" }}
                      />
                      <div className='user-details'>
                        <h4
                          onClick={() =>
                            (window.location.href = `/user/${user._id}`)
                          }
                          style={{ cursor: "pointer" }}
                        >
                          {user.firstName} {user.lastName}
                        </h4>
                        <p className='username'>@{user.username}</p>
                        {user.bio && <p className='bio'>{user.bio}</p>}
                        {user.title && <p className='title'>{user.title}</p>}
                      </div>
                    </div>
                    <div className='user-actions'>
                      <FriendButton
                        userId={user._id}
                        className='search-friend-btn'
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='no-results'>
                <p>No users found matching "{searchQuery}"</p>
                <p className='suggestion'>
                  Try searching with a different name or username
                </p>
              </div>
            )}
          </>
        )}

        {!hasSearched && !isSearching && (
          <div className='search-tips'>
            <h3>Search Tips</h3>
            <ul>
              <li>Search by first name, last name, or username</li>
              <li>Try partial matches (e.g., "john" will find "Johnny")</li>
              <li>Use exact spelling for better results</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserSearch;
