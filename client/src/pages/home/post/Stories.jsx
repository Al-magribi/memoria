import React, { useRef, useState } from "react";
import * as Fi from "react-icons/fi";
import "./stories.scss";
import { useSelector } from "react-redux";
import {
  useGetStoriesQuery,
  useCreateStoryMutation,
} from "../../../services/api/story/StoryApi";

const Stories = () => {
  const storiesRef = useRef(null);
  const { user } = useSelector((state) => state.user);

  const { data: storiesData, isLoading, refetch } = useGetStoriesQuery();
  const [createStory, { isLoading: isUploading }] = useCreateStoryMutation();
  const [modal, setModal] = useState({ open: false, userStories: [], idx: 0 });
  const inputRef = useRef(null);
  const [error, setError] = useState("");

  console.log(storiesData);

  const scroll = (direction) => {
    if (storiesRef.current) {
      const { scrollLeft } = storiesRef.current;
      const scrollAmount = 200;
      storiesRef.current.scrollTo({
        left:
          direction === "left"
            ? scrollLeft - scrollAmount
            : scrollLeft + scrollAmount,
        behavior: "smooth",
      });
    }
  };

  const openModal = (userStories) => {
    setModal({
      open: true,
      userStories: userStories.stories,
      idx: 0,
      user: userStories.user,
    });
  };
  const closeModal = () => setModal({ open: false, userStories: [], idx: 0 });
  const nextStory = () =>
    setModal((m) => ({
      ...m,
      idx: Math.min(m.idx + 1, m.userStories.length - 1),
    }));
  const prevStory = () =>
    setModal((m) => ({ ...m, idx: Math.max(m.idx - 1, 0) }));

  const handleFileChange = async (e) => {
    setError("");
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      setError("File harus berupa gambar atau video.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("Ukuran file maksimal 15MB.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      await createStory(formData).unwrap();
    } catch (err) {
      setError(err?.data?.error || "Gagal upload story");
    }
    e.target.value = ""; // reset input
  };

  return (
    <div className='stories-wrapper'>
      <button className='stories-nav left' onClick={() => scroll("left")}>
        {" "}
        <Fi.FiChevronsLeft />{" "}
      </button>
      <div className='stories' ref={storiesRef}>
        {/* Create Story */}
        <div className='story'>
          <img src={user?.profilePicture} alt={user?.name} loading='lazy' />
          <div className='create-story-icon'>
            <span className='pointer' onClick={() => inputRef.current.click()}>
              {isUploading ? <span className='story-uploading'>...</span> : "+"}
              <input
                type='file'
                ref={inputRef}
                accept='image/*,video/*'
                style={{ display: "none" }}
                onChange={handleFileChange}
                disabled={isUploading}
              />
            </span>
          </div>
          <div className='story-name'>
            <p>Create Story</p>
          </div>
        </div>
        {/* Stories from backend */}
        {!isLoading &&
          storiesData?.map((userStories) => (
            <div
              className='story'
              key={userStories.user._id}
              onClick={() => openModal(userStories)}
            >
              {/* Tampilkan story pertama */}
              {userStories.stories[0].fileType === "image" ? (
                <img src={userStories.stories[0].fileUrl} alt='story' />
              ) : (
                <video
                  src={userStories.stories[0].fileUrl}
                  alt='story'
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  muted
                />
              )}
              <div className='story-avatar'>
                <img
                  src={userStories.user.profilePicture}
                  alt={`${userStories.user.firstName} ${userStories.user.lastName}`}
                />
              </div>
              <div className='story-name'>
                <p>{`${userStories.user.firstName} ${userStories.user.lastName}`}</p>
              </div>
            </div>
          ))}
      </div>
      <button className='stories-nav right' onClick={() => scroll("right")}>
        {" "}
        <Fi.FiChevronsRight />{" "}
      </button>

      {/* Modal/Slider untuk story per user */}
      {modal.open && (
        <div className='story-modal' onClick={closeModal}>
          <div
            className='story-modal-content'
            onClick={(e) => e.stopPropagation()}
          >
            <div className='story-modal-header'>
              <img
                src={modal.user.profilePicture}
                alt={`${modal.user.firstName} ${modal.user.lastName}`}
                className='story-modal-avatar'
              />
              <span>{`${modal.user.firstName} ${modal.user.lastName}`}</span>
              <button onClick={closeModal} className='close-btn'>
                &times;
              </button>
            </div>
            <div className='story-modal-body'>
              {modal.userStories[modal.idx].fileType === "image" ? (
                <img
                  src={modal.userStories[modal.idx].fileUrl}
                  alt='story'
                  className='story-modal-img'
                />
              ) : (
                <video
                  src={modal.userStories[modal.idx].fileUrl}
                  controls
                  className='story-modal-img'
                />
              )}
            </div>
            <div className='story-modal-footer'>
              <button onClick={prevStory} disabled={modal.idx === 0}>
                Prev
              </button>
              <span>
                {modal.idx + 1} / {modal.userStories.length}
              </span>
              <button
                onClick={nextStory}
                disabled={modal.idx === modal.userStories.length - 1}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
      {error && <div className='story-error'>{error}</div>}
    </div>
  );
};

export default Stories;
