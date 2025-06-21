import React, { useRef } from "react";
import * as Fi from "react-icons/fi";
import "./stories.scss";

const storiesData = [
  {
    id: 2,
    name: "Yeni Rahayu",
    image: "https://images.pexels.com/photos/457937/pexels-photo-457937.jpeg",
    profilePicture:
      "https://images.pexels.com/photos/2218786/pexels-photo-2218786.jpeg",
  },
  {
    id: 3,
    name: "Naura Indah",
    image: "https://images.pexels.com/photos/301489/pexels-photo-301489.jpeg",
    profilePicture:
      "https://images.pexels.com/photos/2218786/pexels-photo-2218786.jpeg",
  },
  {
    id: 4,
    name: "Mulya Sari",
    image: "https://images.pexels.com/photos/1619854/pexels-photo-1619854.jpeg",
    profilePicture:
      "https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg",
  },
  {
    id: 5,
    name: "Mulya Sari",
    image: "https://images.pexels.com/photos/1619854/pexels-photo-1619854.jpeg",
    profilePicture:
      "https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg",
  },
  {
    id: 6,
    name: "Mulya Sari",
    image: "https://images.pexels.com/photos/1619854/pexels-photo-1619854.jpeg",
    profilePicture:
      "https://images.pexels.com/photos/2613260/pexels-photo-2613260.jpeg",
  },
];

const Stories = () => {
  const storiesRef = useRef(null);

  const scroll = (direction) => {
    if (storiesRef.current) {
      const { scrollLeft, clientWidth } = storiesRef.current;
      const scrollAmount = 200; // lebar 1 card + gap
      storiesRef.current.scrollTo({
        left:
          direction === "left"
            ? scrollLeft - scrollAmount
            : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const user = {
    profilePicture: "./user-1.jpg",
  };

  const inputRef = useRef(null);

  return (
    <div className='stories-wrapper'>
      <button className='stories-nav left' onClick={() => scroll("left")}>
        <Fi.FiChevronsLeft />
      </button>
      <div className='stories' ref={storiesRef}>
        <div className='story'>
          <img src={user?.profilePicture} alt={user?.name} />

          <div className='create-story-icon'>
            <span className='pointer' onClick={() => inputRef.current.click()}>
              +
              <input
                type='file'
                ref={inputRef}
                accept='image/*'
                style={{ display: "none" }}
              />
            </span>
          </div>

          <div className='story-name'>
            <p>Create Story</p>
          </div>
        </div>

        {storiesData.map((story) => (
          <div className='story' key={story.id}>
            <img src={story.image} alt={story.name} />
            {story.isCreate ? (
              <div className='create-story-icon'>
                <span>+</span>
              </div>
            ) : (
              <div className='story-avatar'>
                <img src={story.profilePicture} alt={story.name} />
              </div>
            )}
            <div className='story-name'>
              <p>{story.name}</p>
            </div>
          </div>
        ))}
      </div>
      <button className='stories-nav right' onClick={() => scroll("right")}>
        <Fi.FiChevronsRight />
      </button>
    </div>
  );
};

export default Stories;
